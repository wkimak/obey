import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import {
  errorToResponse,
  jsonError,
  jsonOk,
  jsonZodError,
} from "@/lib/api/http";
import { ArchiveStrategyBodySchema } from "@/lib/api/schemas/strategies";
import type { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id: strategyId } = await params;
  if (!strategyId) return jsonError("Missing strategy id", 400);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = ArchiveStrategyBodySchema.safeParse(body);
  if (!parsed.success) return jsonZodError(parsed.error);

  try {
    const strategy = await prisma.$transaction(async (tx) => {
      const target = await tx.strategy.findFirst({
        where: { id: strategyId, userId },
        select: { id: true, archived: true },
      });
      if (!target) return null;

      const shouldArchive = parsed.data.archived;

      if (!shouldArchive) {
        // Restoring an archived strategy makes it the active one.
        await tx.strategy.updateMany({
          where: { userId, id: { not: strategyId } },
          data: { archived: true },
        });
      }

      await tx.strategy.update({
        where: { id: strategyId },
        data: { archived: shouldArchive },
      });

      return tx.strategy.findUnique({
        where: { id: strategyId },
        select: { id: true, name: true, archived: true, updatedAt: true },
      });
    });

    if (!strategy) return jsonError("Strategy not found", 404);

    return jsonOk({ strategy });
  } catch (err) {
    return errorToResponse(err);
  }
}

