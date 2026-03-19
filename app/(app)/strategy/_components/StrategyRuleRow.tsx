"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GlobalRule } from "@/lib/types/api/strategies";

type StrategyRuleRowDraft = {
  id: string;
  ruleInput: string;
  optionalDescription: string;
};

type StrategyRuleRowProps = {
  sectionId: string;
  row: StrategyRuleRowDraft;
  globalRules: GlobalRule[];
  globalRulesLoading: boolean;

  globalRuleIdByTitleLower: Map<string, string>;
  globalRuleTitleById: Map<string, string>;

  updateRule: (
    sectionId: string,
    ruleId: string,
    patch: Partial<StrategyRuleRowDraft>,
  ) => void;

  onRemoveRule: () => void;
  canRemoveRule: boolean;
};

export function StrategyRuleRow({
  sectionId,
  row,
  globalRules,
  globalRulesLoading,
  globalRuleIdByTitleLower,
  globalRuleTitleById,
  updateRule,
  onRemoveRule,
  canRemoveRule,
}: StrategyRuleRowProps) {
  const inputTitle = row.ruleInput.trim();
  const matchedRuleId = inputTitle
    ? globalRuleIdByTitleLower.get(inputTitle.toLowerCase())
    : undefined;

  const isCustom = !matchedRuleId && inputTitle.length > 0;
  const selectValue = inputTitle ? (matchedRuleId ?? "__custom__") : "";

  return (
    <div className="space-y-2">
      <div className="relative">
        <select
          className="h-9 w-full appearance-none rounded-lg border border-input/30 bg-transparent px-2 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
          value={selectValue}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "") {
              updateRule(sectionId, row.id, { ruleInput: "" });
              return;
            }

            if (val === "__custom__") {
              // Keep current typed value (or start blank).
              updateRule(sectionId, row.id, {
                ruleInput: row.ruleInput.trim().length > 0 ? row.ruleInput : "",
              });
              return;
            }

            const nextTitle = globalRuleTitleById.get(val) ?? "";
            updateRule(sectionId, row.id, { ruleInput: nextTitle });
          }}
          aria-label="Select global rule"
        >
          <option value="" disabled>
            Select global rule...
          </option>

          {globalRulesLoading ? (
            <option value="" disabled>
              Loading...
            </option>
          ) : (
            globalRules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))
          )}

          <option value="__custom__">Custom...</option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        {isCustom ? (
          <div className="mt-2">
            <Input
              value={row.ruleInput}
              onChange={(e) =>
                updateRule(sectionId, row.id, { ruleInput: e.target.value })
              }
              placeholder="Custom rule title"
              className="border-input/30"
            />
          </div>
        ) : null}
      </div>

      <Input
        value={row.optionalDescription}
        onChange={(e) =>
          updateRule(sectionId, row.id, {
            optionalDescription: e.target.value,
          })
        }
        placeholder="Optional description..."
        className="border-input/30"
      />

      {canRemoveRule ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemoveRule}
            className="text-destructive hover:text-destructive/80"
          >
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  );
}

