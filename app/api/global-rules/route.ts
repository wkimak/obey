import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const rules = await prisma.rule.findMany({
    where: {
      userId,
      scope: "GLOBAL",
      strategyId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  return jsonOk({ rules });
}

