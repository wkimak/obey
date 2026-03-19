import type { StrategyListItem } from "@/lib/types/api/strategies";

type StrategyListResponse = {
  strategies: Array<{
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    archived: boolean;
    _count?: { strategyRules?: number };
  }>;
};

export async function fetchArchives(): Promise<StrategyListItem[]> {
  const res = await fetch("/api/archives", { method: "GET" });
  if (!res.ok) throw new Error("Failed to load archives");
  const data = (await res.json()) as StrategyListResponse;
  return data.strategies.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    archived: s.archived,
    ruleCount: s._count?.strategyRules ?? 0,
  }));
}

export async function archiveStrategyById(strategyId: string) {
  const res = await fetch(`/api/strategies/${strategyId}/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: true }),
  });
  if (!res.ok) throw new Error("Failed to archive strategy");
  return res.json();
}

export async function restoreStrategyById(strategyId: string) {
  const res = await fetch(`/api/strategies/${strategyId}/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: false }),
  });
  if (!res.ok) throw new Error("Failed to restore strategy");
  return res.json();
}

export async function deleteStrategyById(strategyId: string) {
  const res = await fetch(`/api/strategies/${strategyId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete strategy");
  return res.json();
}
