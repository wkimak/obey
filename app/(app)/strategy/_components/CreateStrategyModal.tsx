"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateStrategyBody, GlobalRule } from "@/lib/types/api/strategies";
import { StrategySectionCard } from "./StrategySectionCard";

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

type CreateStrategyModalProps = {
  onClose: () => void;
  name: string;
  description: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string | null) => void;

  globalRules: GlobalRule[];
  globalRulesLoading: boolean;
  globalRulesErrorText?: string;

  formError: string | null;
  isSubmitting: boolean;
  onSubmit: (payload: { rules: CreateStrategyBody["rules"] }) => void | Promise<void>;
};

function makeId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeNullableString(value: string) {
  const v = value.trim();
  return v.length > 0 ? v : null;
}

export function CreateStrategyModal({
  onClose,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  globalRules,
  globalRulesLoading,
  globalRulesErrorText,
  formError,
  isSubmitting,
  onSubmit,
}: CreateStrategyModalProps) {
  const [localError, setLocalError] = React.useState<string | null>(null);

  const [sections, setSections] = React.useState<StrategySectionDraft[]>(() => [
    {
      id: makeId(),
      name: "General Rules",
      rules: [
        { id: makeId(), ruleInput: "", optionalDescription: "", selectedGlobalRuleId: null },
      ],
    },
  ]);

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: makeId(),
        name: `Section ${prev.length + 1}`,
        rules: [
          { id: makeId(), ruleInput: "", optionalDescription: "", selectedGlobalRuleId: null },
        ],
      },
    ]);
  }

  function addRule(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rules: [
                ...s.rules,
                { id: makeId(), ruleInput: "", optionalDescription: "", selectedGlobalRuleId: null },
              ],
            },
      ),
    );
  }

  function removeRule(sectionId: string, rowId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rules: s.rules.filter((r) => r.id !== rowId),
            },
      ),
    );
  }

  function removeSection(sectionId: string) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  function updateSectionName(sectionId: string, nextName: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              name: nextName,
            },
      ),
    );
  }

  function updateRule(
    sectionId: string,
    ruleId: string,
    patch: Partial<StrategyRuleRowDraft>,
  ) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rules: s.rules.map((r) =>
                r.id !== ruleId ? r : { ...r, ...patch },
              ),
            },
      ),
    );
  }

  function buildPayloadRules(): CreateStrategyBody["rules"] {
    let displayOrder = 0;
    const out: CreateStrategyBody["rules"] = [];

    for (const section of sections) {
      const sectionValue = normalizeNullableString(section.name);

      for (const row of section.rules) {
        const inputTitle = row.ruleInput.trim();
        if (!inputTitle) continue;

        if (row.selectedGlobalRuleId) {
          const displayText = row.optionalDescription.trim();
          if (!displayText) continue;

          out.push({
            ruleId: row.selectedGlobalRuleId,
            section: sectionValue,
            displayText,
            displayOrder,
          });
        } else {
          const description = normalizeNullableString(row.optionalDescription);

          out.push({
            title: inputTitle,
            key: null,
            // For custom/strategy-specific rules, keep the typed input as the strategy value,
            // and let the optional description become the rule description (nullable).
            description,
            section: sectionValue,
            displayText: inputTitle,
            displayOrder,
          });
        }

        displayOrder++;
      }
    }

    return out;
  }

  async function handleCreate() {
    setLocalError(null);

    // FE validation: if a global rule is selected, `displayText` (Value) is required.
    for (const section of sections) {
      for (const row of section.rules) {
        const inputTitle = row.ruleInput.trim();
        if (!inputTitle) continue;

        if (row.selectedGlobalRuleId) {
          const displayText = row.optionalDescription.trim();
          if (!displayText) {
            setLocalError("Value is required for global rules.");
            return;
          }
        }
      }
    }

    const rules = buildPayloadRules();
    if (rules.length < 1) {
      setLocalError("Please add at least one rule.");
      return;
    }

    await onSubmit({ rules });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-xl border border-border/60 bg-background/95 p-6 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Create New Strategy</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Define your trading strategy with sections and rules. Select from
              common rules or create your own.
            </p>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div
          className="mt-6 space-y-4 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Strategy Name</label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Momentum Scalping"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="min-h-[90px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
              value={description ?? ""}
              onChange={(e) =>
                onDescriptionChange(e.target.value ? e.target.value : null)
              }
              placeholder="Describe your strategy..."
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Strategy Rules</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSection}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add Section
            </Button>
          </div>

          <div className="space-y-3">
            {sections.map((section, sectionIndex) => (
              <StrategySectionCard
                key={section.id}
                sectionIndex={sectionIndex}
                section={section}
                globalRules={globalRules}
                globalRulesLoading={globalRulesLoading}
                updateSectionName={updateSectionName}
                updateRule={updateRule}
                addRule={addRule}
                removeSection={removeSection}
                removeRule={removeRule}
              />
            ))}
          </div>

          {(localError || formError) && (
            <div className="text-sm text-destructive">
              {localError ?? formError}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleCreate();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Strategy"}
          </Button>
        </div>

        {globalRulesErrorText ? (
          <div className="mt-3 text-sm text-destructive">{globalRulesErrorText}</div>
        ) : null}
      </div>
    </div>
  );
}

