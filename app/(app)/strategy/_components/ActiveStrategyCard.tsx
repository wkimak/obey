"use client";

import { type Strategy } from "@/lib/types/api/strategies";

function formatCreatedAt(createdAt: string | Date) {
  const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ActiveStrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <div className="rounded-lg border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xl font-semibold">{strategy.name}</div>
          {strategy.description ? (
            <div className="text-sm text-muted-foreground mt-1">
              {strategy.description}
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground mt-2">
            Created {formatCreatedAt(strategy.createdAt)}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Attached Rules ({strategy.strategyRules.length})
        </div>
        {strategy.strategyRules.length > 0 ? (
          <div className="space-y-2">
            {strategy.strategyRules.map((sr) => (
              <div
                key={sr.id}
                className="rounded-md border border-border p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {sr.rule.title}
                  </div>
                  {sr.rule.description ? (
                    <div className="text-xs text-muted-foreground truncate">
                      {sr.rule.description}
                    </div>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  #{sr.displayOrder + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
            No rules attached yet.
          </div>
        )}
      </div>
    </div>
  );
}

