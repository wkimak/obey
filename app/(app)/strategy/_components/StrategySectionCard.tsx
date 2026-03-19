"use client";

import { GripVertical, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GlobalRule } from "@/lib/types/api/strategies";

import { StrategyRuleRow } from "./StrategyRuleRow";

type StrategyRuleRowDraft = {
  id: string;
  ruleInput: string;
  optionalDescription: string;
  selectedGlobalRuleId: string | null;
};

type StrategySectionDraft = {
  id: string;
  name: string;
  rules: StrategyRuleRowDraft[];
};

type StrategySectionCardProps = {
  section: StrategySectionDraft;
  sectionIndex: number;
  globalRules: GlobalRule[];
  globalRulesLoading: boolean;

  updateSectionName: (sectionId: string, nextName: string) => void;
  updateRule: (
    sectionId: string,
    ruleId: string,
    patch: Partial<StrategyRuleRowDraft>,
  ) => void;
  addRule: (sectionId: string) => void;

  removeSection: (sectionId: string) => void;
  removeRule: (sectionId: string, ruleId: string) => void;
};

export function StrategySectionCard({
  section,
  sectionIndex,
  globalRules,
  globalRulesLoading,
  updateSectionName,
  updateRule,
  addRule,
  removeSection,
  removeRule,
}: StrategySectionCardProps) {
  return (
    <div
      className="rounded-lg border border-border/40 bg-muted/10 p-3"
      key={section.id}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium min-w-0">
          <GripVertical className="size-4 text-muted-foreground" />
          <Input
            value={section.name}
            onChange={(e) => updateSectionName(section.id, e.target.value)}
            className="h-8 w-full max-w-[220px] bg-transparent px-2 py-0 text-sm font-medium border-input/30"
          />
        </div>
        {sectionIndex === 0 ? null : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeSection(section.id)}
            className="text-destructive hover:text-destructive/80"
          >
            Remove
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {section.rules.map((row, ruleIndex) => (
          <StrategyRuleRow
            key={row.id}
            sectionId={section.id}
            row={row}
            globalRules={globalRules}
            globalRulesLoading={globalRulesLoading}
            updateRule={updateRule}
            onRemoveRule={() => removeRule(section.id, row.id)}
            canRemoveRule={!(sectionIndex === 0 && ruleIndex === 0)}
          />
        ))}

        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addRule(section.id)}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Rule
          </Button>
        </div>
      </div>
    </div>
  );
}

