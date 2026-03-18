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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reportId?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { reportId } = await params;
  if (!reportId) return jsonError("Missing reportId", 400);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = ReplaceBrokenRulesBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  const brokenRuleIds = Array.from(new Set(parsed.data.brokenRuleIds));

  try {
    const report = await prisma.report.findFirst({
      where: { id: reportId, userId },
      select: { id: true },
    });
    if (!report) return jsonError("Report not found", 404);

    // Validate that all provided rules belong to the authenticated user.
    if (brokenRuleIds.length > 0) {
      const rules = await prisma.rule.findMany({
        where: { id: { in: brokenRuleIds }, userId },
        select: { id: true },
      });
      const found = new Set(rules.map((r) => r.id));
      const missing = brokenRuleIds.filter((id) => !found.has(id));
      if (missing.length > 0) {
        throw new HttpError(400, `Invalid broken ruleIds: ${missing.slice(0, 3).join(", ")}`);
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

