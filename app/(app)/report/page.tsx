"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

import { createReport, fetchReportForDate, updateReport } from "@/lib/api/reports";
import { fetchActiveStrategy } from "@/lib/api/strategies";
import { todayLocalYmd } from "@/lib/report-date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ReportDatePicker } from "./_components/ReportDatePicker";
import { ReportHeader } from "./_components/ReportHeader";

const activeKey = ["strategies", "active"] as const;

function reportQueryKey(strategyId: string, ymd: string) {
  return ["report", strategyId, ymd] as const;
}

export default function ReportPage() {
  const queryClient = useQueryClient();
  const [selectedYmd, setSelectedYmd] = React.useState(todayLocalYmd);
  const [pnlInput, setPnlInput] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saveBanner, setSaveBanner] = React.useState<string | null>(null);

  const activeStrategyQuery = useQuery({
    queryKey: activeKey,
    queryFn: fetchActiveStrategy,
  });

  const strategyId = activeStrategyQuery.data?.id;

  React.useEffect(() => {
    setPnlInput("");
    setNotes("");
    setFormError(null);
  }, [selectedYmd, strategyId]);

  const reportQuery = useQuery({
    queryKey: strategyId
      ? reportQueryKey(strategyId, selectedYmd)
      : ["report", "none", selectedYmd],
    queryFn: () => fetchReportForDate(strategyId!, selectedYmd),
    enabled: Boolean(strategyId),
  });

  React.useEffect(() => {
    if (!strategyId || !reportQuery.isSuccess) return;
    if (reportQuery.data) {
      setPnlInput(
        reportQuery.data.pnl === 0 ? "" : String(reportQuery.data.pnl),
      );
      setNotes(reportQuery.data.notes ?? "");
    }
  }, [strategyId, selectedYmd, reportQuery.isSuccess, reportQuery.data]);

  React.useEffect(() => {
    if (!saveBanner) return;
    const t = window.setTimeout(() => setSaveBanner(null), 4000);
    return () => window.clearTimeout(t);
  }, [saveBanner]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!strategyId) throw new Error("No active strategy");
      const pnlRaw = pnlInput.trim() === "" ? "0" : pnlInput.trim();
      const pnlNum = Number(pnlRaw);
      if (Number.isNaN(pnlNum)) {
        throw new Error("P&L must be a valid number");
      }

      const notesPayload = notes.trim() === "" ? null : notes.trim();
      const key = reportQueryKey(strategyId, selectedYmd);
      const existing = queryClient.getQueryData(key) as
        | Awaited<ReturnType<typeof fetchReportForDate>>
        | undefined;

      if (existing) {
        const report = await updateReport(strategyId, existing.id, {
          pnl: pnlNum,
          notes: notesPayload,
        });
        return { mode: "update" as const, report };
      }
      const report = await createReport(strategyId, {
        reportDate: selectedYmd,
        pnl: pnlNum,
        notes: notesPayload,
      });
      return { mode: "create" as const, report };
    },
    onSuccess: async (result) => {
      if (strategyId) {
        await queryClient.invalidateQueries({
          queryKey: reportQueryKey(strategyId, selectedYmd),
        });
      }
      setFormError(null);
      setSaveBanner(
        result.mode === "update"
          ? "Report updated successfully"
          : "Report saved successfully",
      );
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  const isEdit = Boolean(reportQuery.data);
  const formDisabled =
    !strategyId || reportQuery.isLoading || reportQuery.isFetching;

  return (
    <div className="flex h-full flex-col">
      <ReportHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
          {activeStrategyQuery.isLoading ? (
            <div className="rounded-lg border border-border p-6 text-muted-foreground">
              Loading…
            </div>
          ) : activeStrategyQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              {String(activeStrategyQuery.error)}
            </div>
          ) : !strategyId ? (
            <div className="rounded-lg border border-border p-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                You need an active strategy before you can create daily reports.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/strategy">Go to Strategy Reference</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/30 p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-base font-semibold">
                  {isEdit ? "Edit Report" : "New Report"}
                </h2>
                <ReportDatePicker
                  valueYmd={selectedYmd}
                  onChangeYmd={setSelectedYmd}
                  disabled={saveMutation.isPending}
                />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="report-pnl">P&amp;L (Profit/Loss)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="report-pnl"
                      inputMode="decimal"
                      placeholder="0.00"
                      disabled={formDisabled}
                      value={pnlInput}
                      onChange={(e) => setPnlInput(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-notes">Notes</Label>
                  <Textarea
                    id="report-notes"
                    disabled={formDisabled}
                    placeholder="What behavioral change could you make to reduce friction with your discipline?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {formError ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    disabled={formDisabled || saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                    className="gap-2"
                  >
                    <Save className="size-4" />
                    {isEdit ? "Update Report" : "Save Report"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {saveBanner ? (
            <div
              className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-lg"
              role="status"
            >
              <span className="text-primary">✓</span>
              {saveBanner}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
