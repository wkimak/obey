import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import { errorToResponse, jsonError, jsonOk, jsonZodError } from "@/lib/api/http";
import {
  CreateStrategyBodySchema,
  StrategyRuleExistingSchema,
  StrategyRuleNewSchema,
} from "@/lib/api/schemas/strategies";
import { HttpError } from "@/lib/api/errors";
import { z } from "zod";
import type { NextRequest } from "next/server";

type CreateStrategyBody = z.infer<typeof CreateStrategyBodySchema>;
type ExistingStrategyRuleItem = z.infer<typeof StrategyRuleExistingSchema>;
type NewStrategyRuleItem = z.infer<typeof StrategyRuleNewSchema>;

function isExistingRuleItem(
  item: CreateStrategyBody["rules"][number],
): item is ExistingStrategyRuleItem {
  return "ruleId" in item;
}

function isNewRuleItem(
  item: CreateStrategyBody["rules"][number],
): item is NewStrategyRuleItem {
  return !("ruleId" in item);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = CreateStrategyBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  try {
    const strategy = await prisma.$transaction(async (tx) => {
      const { name, description, rules } = parsed.data as CreateStrategyBody;

      // At most one non-archived strategy per user: archive the current one before creating.
      await tx.strategy.updateMany({
        where: { userId, archived: false },
        data: { archived: true },
      });

      const createdStrategy = await tx.strategy.create({
        data: {
          userId,
          name,
          description: description ?? null,
          archived: false,
        },
        select: { id: true },
      });

      const existingItems = rules.filter(isExistingRuleItem);
      const newItems = rules.filter(isNewRuleItem);

      // Deduplicate by ruleId so createMany doesn't violate the @@unique([strategyId, ruleId]).
      const existingByRuleId = new Map<string, ExistingStrategyRuleItem>();
      for (const item of existingItems) {
        if (!existingByRuleId.has(item.ruleId)) {
          existingByRuleId.set(item.ruleId, item);
        }
      }

      const existingRuleIds = Array.from(existingByRuleId.keys());

      if (existingRuleIds.length > 0) {
        const globalRules = await tx.rule.findMany({
          where: {
            userId,
            scope: "GLOBAL",
            strategyId: null,
            id: { in: existingRuleIds },
          },
          select: { id: true },
        });

        const found = new Set(globalRules.map((r) => r.id));
        const missing = existingRuleIds.filter((id) => !found.has(id));
        if (missing.length > 0) {
          throw new HttpError(400, `Invalid global ruleIds: ${missing.slice(0, 3).join(", ")}`);
        }

        await tx.strategyRule.createMany({
          data: existingRuleIds.map((ruleId) => {
            const item = existingByRuleId.get(ruleId)!;
            return {
              strategyId: createdStrategy.id,
              ruleId,
              section: item.section ?? null,
              displayText: item.displayText,
              displayOrder: item.displayOrder,
            };
          }),
        });
      }

      for (const item of newItems) {
        const newRule = await tx.rule.create({
          data: {
            userId,
            scope: "STRATEGY",
            strategyId: createdStrategy.id,
            title: item.title,
            key: item.key ?? null,
            description: item.description ?? null,
          },
          select: { id: true },
        });

        await tx.strategyRule.create({
          data: {
            strategyId: createdStrategy.id,
            ruleId: newRule.id,
            section: item.section ?? null,
            displayText: item.displayText,
            displayOrder: item.displayOrder,
          },
        });
      }

      return tx.strategy.findUnique({
        where: { id: createdStrategy.id },
        include: {
          strategyRules: {
            orderBy: { displayOrder: "asc" },
            include: { rule: true },
          },
        },
      });
    });

    if (!strategy) throw new HttpError(500, "Failed to create strategy");
    return jsonOk({ strategy });
  } catch (err) {
    return errorToResponse(err);
  }
}

