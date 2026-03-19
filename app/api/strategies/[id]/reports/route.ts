import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import {
  errorToResponse,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api/http";
import {
  CreateReportBodySchema,
  GetReportsQuerySchema,
} from "@/lib/api/schemas/reports";
import { assertReportDateNotInFuture } from "@/lib/api/assert-report-date";
import { isoDateSchema, endOfUtcDay, startOfUtcDay } from "@/lib/api/date";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id: strategyId } = await params;
  if (!strategyId) return jsonError("Missing strategy id", 400);

  const { searchParams } = new URL(req.url);
  const parsedQuery = GetReportsQuerySchema.safeParse({
    date: searchParams.get("date") ?? undefined,
  });
  if (!parsedQuery.success) return jsonZodError(parsedQuery.error);

  try {
    const strategy = await prisma.strategy.findFirst({
      where: { id: strategyId, userId },
      select: { id: true },
    });
    if (!strategy) return jsonError("Strategy not found", 404);

    if (parsedQuery.data.date) {
      const day = isoDateSchema.parse(parsedQuery.data.date);
      const report = await prisma.report.findFirst({
        where: {
          userId,
          strategyId,
          reportDate: { gte: startOfUtcDay(day), lte: endOfUtcDay(day) },
        },
        include: {
          brokenRules: { select: { ruleId: true } },
        },
      });
      if (!report) return jsonError("Report not found", 404);

      return jsonOk({ report: serializeReport(report) });
    }

    const reports = await prisma.report.findMany({
      where: { userId, strategyId },
      orderBy: { reportDate: "desc" },
      include: {
        brokenRules: { select: { ruleId: true } },
      },
    });

    return jsonOk({ reports: reports.map(serializeReport) });
  } catch (err) {
    return errorToResponse(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id: strategyId } = await params;
  if (!strategyId) return jsonError("Missing strategy id", 400);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = CreateReportBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  try {
    const strategy = await prisma.strategy.findFirst({
      where: { id: strategyId, userId },
      select: { id: true },
    });
    if (!strategy) return jsonError("Strategy not found", 404);

    assertReportDateNotInFuture(parsed.data.reportDate);
    const day = isoDateSchema.parse(parsed.data.reportDate);

    const report = await prisma.report.create({
      data: {
        userId,
        strategyId,
        reportDate: startOfUtcDay(day),
        pnl: new Prisma.Decimal(parsed.data.pnl.toString()),
        notes: parsed.data.notes ?? null,
      },
    });

    return jsonOk({
      report: serializeReport({
        ...report,
        brokenRules: [],
      }),
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return jsonError(
        "A report already exists for this strategy and date",
        409,
      );
    }
    return errorToResponse(err);
  }
}

