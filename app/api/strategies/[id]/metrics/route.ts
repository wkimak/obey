import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import { errorToResponse, jsonError, jsonOk } from "@/lib/api/http";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id: strategyId } = await params;
  if (!strategyId) return jsonError("Missing strategy id", 400);

  try {
    const owned = await prisma.strategy.findFirst({
      where: { id: strategyId, userId },
      select: { id: true },
    });
    if (!owned) return jsonError("Strategy not found", 404);

    const totalRules = await prisma.strategyRule.count({
      where: { strategyId },
    });

    const reports = await prisma.report.findMany({
      where: { strategyId },
      orderBy: { reportDate: "asc" },
      select: {
        reportDate: true,
        pnl: true,
        brokenRules: { select: { ruleId: true } },
      },
    });

    const tradingDays = reports.length;

    if (tradingDays === 0) {
      return jsonOk({
        metrics: {
          strategyId,
          disciplineScore: 100,
          tradingDays: 0,
          averagePnl: 0,
          mostBrokenRule: { ruleId: null, title: null, brokenCount: 0 },
          rulesFollowedTotal: 0,
          rulesBrokenTotal: 0,
          disciplineScoreOverTime: [],
          pnlOverTime: [],
          // kept for backward compatibility with the earlier implementation
          reportCount: 0,
        },
      });
    }

    const disciplineScoreOverTime: Array<{
      date: string;
      score: number;
    }> = [];
    const pnlOverTime: Array<{ date: string; pnl: number }> = [];

    let rulesFollowedTotal = 0;
    let rulesBrokenTotal = 0;
    let pnlTotal = 0;

    const brokenRuleCountById = new Map<string, number>();

    for (const report of reports) {
      const brokenCount = report.brokenRules.length;
      const followedCount = totalRules > 0 ? Math.max(totalRules - brokenCount, 0) : 0;

      rulesFollowedTotal += followedCount;
      rulesBrokenTotal += brokenCount;

      const score =
        totalRules > 0 ? (followedCount / totalRules) * 100 : 100;

      const date = report.reportDate.toISOString().slice(0, 10);
      disciplineScoreOverTime.push({ date, score: Number(score.toFixed(2)) });

      pnlTotal += report.pnl.toNumber();
      pnlOverTime.push({ date, pnl: report.pnl.toNumber() });

      for (const br of report.brokenRules) {
        brokenRuleCountById.set(
          br.ruleId,
          (brokenRuleCountById.get(br.ruleId) ?? 0) + 1,
        );
      }
    }

    const disciplineScore =
      totalRules > 0
        ? (rulesFollowedTotal / (rulesFollowedTotal + rulesBrokenTotal)) * 100
        : 100;

    const averagePnl = pnlTotal / tradingDays;

    let mostBrokenRuleId: string | null = null;
    let mostBrokenCount = 0;
    for (const [ruleId, count] of brokenRuleCountById.entries()) {
      if (count > mostBrokenCount) {
        mostBrokenCount = count;
        mostBrokenRuleId = ruleId;
      }
    }

    let mostBrokenRuleTitle: string | null = null;
    if (mostBrokenRuleId) {
      const rule = await prisma.rule.findFirst({
        where: { id: mostBrokenRuleId, userId },
        select: { title: true },
      });
      mostBrokenRuleTitle = rule?.title ?? null;
    }

    return jsonOk({
      metrics: {
        strategyId,
        disciplineScore: Number(disciplineScore.toFixed(2)),
        tradingDays,
        averagePnl,
        mostBrokenRule: {
          ruleId: mostBrokenRuleId,
          title: mostBrokenRuleTitle,
          brokenCount: mostBrokenCount,
        },
        rulesFollowedTotal,
        rulesBrokenTotal,
        disciplineScoreOverTime,
        pnlOverTime,
        // backward compatibility
        reportCount: tradingDays,
      },
    });
  } catch (err) {
    return errorToResponse(err);
  }
}

