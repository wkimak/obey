"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteStrategyById,
  fetchArchives,
  restoreStrategyById,
} from "@/lib/api/archives";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function formatCreatedAt(createdAt: string | Date) {
  const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ArchivesPage() {
  const queryClient = useQueryClient();

  const archivesQuery = useQuery({
    queryKey: ["archives"],
    queryFn: fetchArchives,
  });

  const restoreMutation = useMutation({
    mutationFn: (strategyId: string) => restoreStrategyById(strategyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["archives"] });
      await queryClient.invalidateQueries({ queryKey: ["strategies", "active"] });
      await queryClient.invalidateQueries({ queryKey: ["strategies", "list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (strategyId: string) => deleteStrategyById(strategyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["archives"] });
      await queryClient.invalidateQueries({ queryKey: ["strategies", "active"] });
      await queryClient.invalidateQueries({ queryKey: ["strategies", "list"] });
    },
  });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-20 w-full max-w-3xl items-center gap-4 px-6 py-4">
          <SidebarTrigger className="self-center" />
          <Separator orientation="vertical" className="h-10 self-center" />
          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="text-lg font-semibold leading-tight">Archives</h1>
            <p className="text-sm text-muted-foreground">
              Restore or permanently delete archived strategies.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-4">
          {archivesQuery.isLoading ? (
            <div className="rounded-lg border border-border p-6 text-muted-foreground">
              Loading archives...
            </div>
          ) : archivesQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              Failed to load archives.
            </div>
          ) : archivesQuery.data && archivesQuery.data.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">
                {archivesQuery.data.length} archived{" "}
                {archivesQuery.data.length === 1 ? "strategy" : "strategies"}
              </div>
              {archivesQuery.data.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border p-5 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-xl font-semibold">{s.name}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {s.ruleCount} {s.ruleCount === 1 ? "rule" : "rules"} • created{" "}
                      {formatCreatedAt(s.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        void deleteMutation.mutateAsync(s.id);
                      }}
                      className="gap-2"
                    >
                      <Trash2 className="size-4" />
                      Delete Permanently
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={restoreMutation.isPending}
                      onClick={() => {
                        void restoreMutation.mutateAsync(s.id);
                      }}
                      className="gap-2"
                    >
                      <RotateCcw className="size-4" />
                      Restore Strategy
                    </Button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              No archived strategies yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}