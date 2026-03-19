import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import { errorToResponse, jsonError, jsonOk } from "@/lib/api/http";
import type { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
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

    // With DB-level cascades (FK onDelete: Cascade), deleting the strategy
    // will automatically remove dependent rows (StrategyRule, Report, BrokenRule,
    // and strategy-scoped Rules via Rule.strategyId).
    await prisma.strategy.delete({
      where: { id: strategyId },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    return errorToResponse(err);
  }
}

