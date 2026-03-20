import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import {
  errorToResponse,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api/http";
import { ReplaceBrokenRulesBodySchema } from "@/lib/api/schemas/broken-rules";
import { HttpError } from "@/lib/api/errors";
import type { NextRequest } from "next/server";

/**
 * Replace all BrokenRule rows for a report with the given rule IDs.
 * Each ruleId must belong to the report's strategy (via StrategyRule).
 */
export async function PUT(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ id?: string; reportId?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id: strategyId, reportId } = await params;
  if (!strategyId || !reportId) {
    return jsonError("Missing strategy id or report id", 400);
  }

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = ReplaceBrokenRulesBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  const brokenRuleIds = Array.from(new Set(parsed.data.brokenRuleIds));

  try {
    const report = await prisma.report.findFirst({
      where: { id: reportId, strategyId },
      include: { strategy: { select: { userId: true } } },
    });
    if (!report || report.strategy.userId !== userId) {
      return jsonError("Report not found", 404);
    }
    if (report.userId !== userId) {
      await prisma.report.update({
        where: { id: reportId },
        data: { userId },
      });
    }

    if (brokenRuleIds.length > 0) {
      const allowed = await prisma.strategyRule.findMany({
        where: { strategyId, ruleId: { in: brokenRuleIds } },
        select: { ruleId: true },
      });
      const allowedSet = new Set(allowed.map((r) => r.ruleId));
      const invalid = brokenRuleIds.filter((id) => !allowedSet.has(id));
      if (invalid.length > 0) {
        throw new HttpError(
          400,
          `Rules are not part of this strategy: ${invalid.slice(0, 3).join(", ")}`,
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.brokenRule.deleteMany({ where: { reportId } });
      if (brokenRuleIds.length === 0) return;
      await tx.brokenRule.createMany({
        data: brokenRuleIds.map((ruleId) => ({ reportId, ruleId })),
      });
    });

    return jsonOk({ brokenRuleIds });
  } catch (err) {
    return errorToResponse(err);
  }
}
