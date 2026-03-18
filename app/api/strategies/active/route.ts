import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import {
  errorToResponse,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api/http";
import { SetActiveStrategyBodySchema } from "@/lib/api/schemas/strategies";
import { HttpError } from "@/lib/api/errors";
import type { NextRequest } from "next/server";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    const strategy = await prisma.strategy.findFirst({
      where: { userId, archived: false },
      orderBy: { updatedAt: "desc" },
      include: {
        strategyRules: {
          orderBy: { displayOrder: "asc" },
          include: { rule: true },
        },
      },
    });

    if (!strategy) return jsonError("No active strategy", 404);
    return jsonOk({ strategy });
  } catch (err) {
    return errorToResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = SetActiveStrategyBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  const { strategyId } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.strategy.findFirst({
        where: { id: strategyId, userId },
        select: { id: true },
      });
      if (!target) throw new HttpError(404, "Strategy not found");

      await tx.strategy.updateMany({
        where: { userId, id: { not: strategyId } },
        data: { archived: true },
      });
      await tx.strategy.updateMany({
        where: { userId, id: strategyId },
        data: { archived: false },
      });

      return tx.strategy.findUnique({
        where: { id: strategyId },
        include: {
          strategyRules: {
            orderBy: { displayOrder: "asc" },
            include: { rule: true },
          },
        },
      });
    });

    if (!updated) throw new HttpError(500, "Failed to update active strategy");
    return jsonOk({ strategy: updated });
  } catch (err) {
    return errorToResponse(err);
  }
}

