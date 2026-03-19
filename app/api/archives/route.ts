import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const strategies = await prisma.strategy.findMany({
    where: { userId, archived: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      archived: true,
      updatedAt: true,
      createdAt: true,
      _count: {
        select: { strategyRules: true },
      },
    },
  });

  return jsonOk({ strategies });
}

