"use client";

import * as React from "react";
import type { StrategyRuleWithRule } from "@/lib/types/api/strategies";
import { cn } from "@/lib/utils";

function groupStrategyRules(rules: StrategyRuleWithRule[]) {
  const map = new Map<string, StrategyRuleWithRule[]>();
  for (const sr of rules) {
    const section = sr.section?.trim() || "General Rules";
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(sr);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function RulesBrokenSection({
  strategyRules,
  brokenRuleIds,
  onToggleRule,
  disabled,
}: {
  strategyRules: StrategyRuleWithRule[];
  brokenRuleIds: string[];
  onToggleRule: (ruleId: string, nextBroken: boolean) => void;
  disabled?: boolean;
}) {
  const brokenSet = React.useMemo(
    () => new Set(brokenRuleIds),
    [brokenRuleIds],
  );

  const total = strategyRules.length;
  const broken = brokenRuleIds.length;
  const adherence =
    total === 0 ? 100 : Math.round((1 - broken / total) * 100);

  const groups = React.useMemo(
    () => groupStrategyRules(strategyRules),
    [strategyRules],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Rules Broken</h3>
          <p className="text-xs text-muted-foreground">
            Check any rules you broke today.
          </p>
        </div>
        <p
          className={cn(
            "text-sm font-medium tabular-nums",
            broken === 0 ? "text-emerald-500" : "text-red-500",
          )}
        >
          {broken}/{total} broken ({adherence}% adherence)
        </p>
      </div>

      {total === 0 ? (
        <p className="rounded-lg border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
          This strategy has no rules yet. Add rules under Strategy Reference.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map(([section, rows]) => (
            <div key={section} className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section}
              </h4>
              <ul className="space-y-2">
                {rows.map((sr) => {
                  const isBroken = brokenSet.has(sr.ruleId);
                  return (
                    <li key={sr.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                          disabled && "cursor-not-allowed opacity-60",
                          isBroken
                            ? "border-red-500/50 bg-red-500/5"
                            : "border-border/80 hover:bg-muted/40",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                          checked={isBroken}
                          disabled={disabled}
                          onChange={(e) =>
                            onToggleRule(sr.ruleId, e.target.checked)
                          }
                        />
                        <span className="min-w-0 flex-1 space-y-0.5">
                          <span
                            className={cn(
                              "block text-sm font-medium",
                              isBroken && "text-red-400",
                            )}
                          >
                            {sr.displayText}
                          </span>
                          {(() => {
                            const desc = sr.rule.description?.trim();
                            const titleAlt =
                              sr.rule.title !== sr.displayText
                                ? sr.rule.title
                                : null;
                            const sub = desc || titleAlt;
                            if (!sub) return null;
                            return (
                              <span
                                className={cn(
                                  "block text-xs text-muted-foreground",
                                  isBroken && "text-red-400/70",
                                )}
                              >
                                {sub}
                              </span>
                            );
                          })()}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
