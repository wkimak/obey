import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import {
  errorToResponse,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api/http";
import { UpdateReportBodySchema } from "@/lib/api/schemas/reports";
import { isoDateSchema, startOfUtcDay } from "@/lib/api/date";
import { Prisma } from "@/lib/generated/prisma/client";
import type { NextRequest } from "next/server";

type ReportBrokenRule = { ruleId: string };
type ReportForApi = {
  id: string;
  userId: string;
  strategyId: string;
  reportDate: Date;
  pnl: { toNumber: () => number };
  notes: string | null;
  brokenRules?: ReportBrokenRule[];
  createdAt: Date;
  updatedAt: Date;
};

function serializeReport(report: ReportForApi) {
  return {
    id: report.id,
    userId: report.userId,
    strategyId: report.strategyId,
    reportDate: report.reportDate.toISOString(),
    pnl: report.pnl.toNumber(),
    notes: report.notes,
    brokenRuleIds: report.brokenRules?.map((br) => br.ruleId) ?? [],
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ strategyId?: string; reportId?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { strategyId, reportId } = await params;
  if (!strategyId || !reportId) {
    return jsonError("Missing strategyId or reportId", 400);
  }

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = UpdateReportBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  try {
    const owned = await prisma.report.findFirst({
      where: { id: reportId, userId, strategyId },
      select: { id: true },
    });
    if (!owned) return jsonError("Report not found", 404);

    const data: Partial<{
      reportDate: Date;
      pnl: InstanceType<typeof Prisma.Decimal>;
      notes: string | null;
    }> = {};
    if (parsed.data.reportDate !== undefined) {
      const day = isoDateSchema.parse(parsed.data.reportDate);
      data.reportDate = startOfUtcDay(day);
    }
    if (parsed.data.pnl !== undefined) {
      data.pnl = new Prisma.Decimal(parsed.data.pnl.toString());
    }
    if (parsed.data.notes !== undefined) {
      data.notes = parsed.data.notes ?? null;
    }

    await prisma.report.updateMany({
      where: { id: reportId, userId, strategyId },
      data,
    });

    const updated = await prisma.report.findUnique({
      where: { id: reportId },
      include: { brokenRules: { select: { ruleId: true } } },
    });

    if (!updated) return jsonError("Report not found", 404);
    return jsonOk({ report: serializeReport(updated) });
  } catch (err) {
    return errorToResponse(err);
  }
}

