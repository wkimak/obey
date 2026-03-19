"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Strategy } from "@/lib/types/api/strategies";

function formatCreatedAt(createdAt: string | Date) {
  const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ActiveStrategyCard({
  strategy,
  onArchive,
  isArchiving,
}: {
  strategy: Strategy;
  onArchive: () => void;
  isArchiving: boolean;
}) {
  const rulesBySection = strategy.strategyRules.reduce(
    (acc, sr) => {
      const sectionName = sr.section?.trim() || "General";
      const bucket = acc.get(sectionName);
      if (bucket) {
        bucket.push(sr);
      } else {
        acc.set(sectionName, [sr]);
      }
      return acc;
    },
    new Map<string, Strategy["strategyRules"]>(),
  );

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
        <Button
          type="button"
          variant="destructive"
          onClick={onArchive}
          disabled={isArchiving}
          className="gap-2"
        >
          <Archive className="size-4" />
          {isArchiving ? "Archiving..." : "Archive Strategy"}
        </Button>
      </div>

      <div className="pt-4 mt-2 border-t border-border/70">
        <div className="text-sm font-medium text-muted-foreground mb-3">
          Attached Rules ({strategy.strategyRules.length})
        </div>
        {strategy.strategyRules.length > 0 ? (
          <div className="space-y-5">
            {Array.from(rulesBySection.entries()).map(([sectionName, rules]) => (
              <div key={sectionName} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {sectionName}
                </div>
                {rules.map((sr) => (
                  <div
                    key={sr.id}
                    className="rounded-md border border-white/25 bg-white/10 p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {sr.rule.title}
                      </div>
                      {sr.displayText ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {sr.displayText}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      #{sr.displayOrder + 1}
                    </div>
                  </div>
                ))}
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

