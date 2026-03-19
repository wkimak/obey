import type {
  CreateStrategyBody,
  GlobalRule,
  Strategy,
} from "@/lib/types/api/strategies";

type ActiveStrategyResponse = { strategy: Strategy };
type GlobalRulesResponse = { rules: GlobalRule[] };

export async function fetchActiveStrategy(): Promise<Strategy | null> {
  const res = await fetch("/api/strategies/active", { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load active strategy");
  const data = (await res.json()) as ActiveStrategyResponse;
  return data.strategy;
}

export async function fetchGlobalRules(): Promise<GlobalRule[]> {
  const res = await fetch("/api/global-rules", { method: "GET" });
  if (!res.ok) throw new Error("Failed to load global rules");
  const data = (await res.json()) as GlobalRulesResponse;
  return data.rules.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    key: r.key,
  }));
}

export async function createStrategy(body: CreateStrategyBody) {
  const res = await fetch("/api/strategies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create strategy");
  const data = (await res.json()) as { strategy: Strategy };
  return data.strategy;
}

