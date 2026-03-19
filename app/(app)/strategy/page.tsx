"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  createStrategy,
  fetchActiveStrategy,
  fetchGlobalRules,
} from "@/lib/api/strategies";
import type { CreateStrategyBody } from "@/lib/types/api/strategies";

import { ActiveStrategyCard } from "./_components/ActiveStrategyCard";
import { CreateStrategyModal } from "./_components/CreateStrategyModal";
import { EmptyState } from "./_components/EmptyState";
import { StrategyHeader } from "./_components/StrategyHeader";

const activeKey = ["strategies", "active"] as const;
const globalRulesKey = ["rules", "global"] as const;

const createStrategySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
});

export default function StrategyPage() {
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const activeStrategyQuery = useQuery({
    queryKey: activeKey,
    queryFn: fetchActiveStrategy,
  });

  const globalRulesQuery = useQuery({
    queryKey: globalRulesKey,
    queryFn: fetchGlobalRules,
    enabled: createOpen,
  });

  const createStrategyMutation = useMutation({
    mutationFn: (body: CreateStrategyBody) => createStrategy(body),
    onSuccess: async () => {
      setCreateOpen(false);
      setFormError(null);
      setName("");
      setDescription(null);
      await queryClient.invalidateQueries({ queryKey: activeKey });
    },
  });
  async function handleCreateSubmit(payload: {
    rules: CreateStrategyBody["rules"];
  }) {
    setFormError(null);

    const parsed = createStrategySchema.safeParse({
      name,
      description,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const body: CreateStrategyBody = {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      rules: payload.rules,
    };

    try {
      await createStrategyMutation.mutateAsync(body);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create strategy",
      );
    }
  }

  return (
    <div className="flex h-full flex-col">
      <StrategyHeader />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {activeStrategyQuery.isLoading ? (
            <div className="rounded-lg border border-border p-6 text-muted-foreground">
              Loading strategy...
            </div>
          ) : activeStrategyQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              {String(activeStrategyQuery.error)}
            </div>
          ) : activeStrategyQuery.data ? (
            <ActiveStrategyCard strategy={activeStrategyQuery.data} />
          ) : (
            <EmptyState onCreate={() => setCreateOpen(true)} />
          )}
        </div>
      </main>

      {createOpen && (
        <CreateStrategyModal
          onClose={() => setCreateOpen(false)}
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          globalRules={globalRulesQuery.data ?? []}
          globalRulesLoading={globalRulesQuery.isLoading}
          globalRulesErrorText={
            globalRulesQuery.isError ? String(globalRulesQuery.error) : undefined
          }
          formError={formError}
          isSubmitting={createStrategyMutation.isPending}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}