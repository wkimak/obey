"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <Select
          value={selectValue || undefined}
          onValueChange={(val) => {
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
        >
          <SelectTrigger className="bg-transparent border-input/30">
            <SelectValue placeholder="Select global rule..." />
          </SelectTrigger>
          <SelectContent>
            {globalRulesLoading ? (
              <SelectItem value="__loading__" disabled>
                Loading...
              </SelectItem>
            ) : (
              globalRules.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title}
                </SelectItem>
              ))
            )}

            <SelectItem value="__custom__">Custom...</SelectItem>
          </SelectContent>
        </Select>

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

