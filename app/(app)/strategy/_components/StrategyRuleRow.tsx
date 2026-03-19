"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { GlobalRule } from "@/lib/types/api/strategies";

type StrategyRuleRowDraft = {
  id: string;
  ruleInput: string;
  optionalDescription: string;
  selectedGlobalRuleId: string | null;
};

type StrategyRuleRowProps = {
  sectionId: string;
  row: StrategyRuleRowDraft;
  globalRules: GlobalRule[];
  globalRulesLoading: boolean;

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
  updateRule,
  onRemoveRule,
  canRemoveRule,
}: StrategyRuleRowProps) {
  const [open, setOpen] = React.useState(false);

  const inputTitle = row.ruleInput.trim();
  const isGlobal = row.selectedGlobalRuleId !== null;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-9 w-full cursor-pointer rounded-lg border border-input/30 bg-transparent px-2 text-sm text-left outline-none focus-visible:border-ring focus-visible:ring-ring/50"
          >
            {inputTitle.length > 0 ? inputTitle : "Type to create strategy goal..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput
              value={row.ruleInput}
              onValueChange={(v) => {
                // Typing means "strategy specific"; only selecting from the list is "global".
                updateRule(sectionId, row.id, {
                  ruleInput: v,
                  selectedGlobalRuleId: null,
                });
              }}
              placeholder="Search global rules or type a new goal..."
            />
            <CommandList>
              <CommandEmpty>
                No global rules match. Your typed text will be treated as strategy-specific.
              </CommandEmpty>
              <CommandGroup heading="Global rules">
                {globalRulesLoading ? (
                  <CommandItem value="__loading__" disabled>
                    Loading...
                  </CommandItem>
                ) : (
                  globalRules.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={r.title}
                      onSelect={() => {
                        updateRule(sectionId, row.id, {
                          ruleInput: r.title,
                          selectedGlobalRuleId: r.id,
                        });
                        setOpen(false);
                      }}
                    >
                      {r.title}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        value={row.optionalDescription}
        onChange={(e) =>
          updateRule(sectionId, row.id, {
            optionalDescription: e.target.value,
          })
        }
        placeholder={isGlobal ? "Value" : "Optional description..."}
        className="border-input/30"
        required={isGlobal}
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

