"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { fetchReportsList } from "@/lib/api/reports";
import { fetchActiveStrategy } from "@/lib/api/strategies";
import {
  buildCalendarGrid,
  formatMonthYear,
  formatShortDate,
  todayLocalYmd,
} from "@/lib/report-date";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const activeKey = ["strategies", "active"] as const;

function reportsQueryKey(strategyId: string) {
  return ["reports", strategyId] as const;
}

/** Report date from API is ISO string; extract YYYY-MM-DD. */
function reportDateToYmd(iso: string): string {
  return iso.slice(0, 10);
}

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}${pnl}`;
}

export default function DashboardPage() {
  const today = todayLocalYmd();
  const now = new Date();
  const [displayYear, setDisplayYear] = React.useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = React.useState(now.getMonth() + 1);

  const activeStrategyQuery = useQuery({
    queryKey: activeKey,
    queryFn: fetchActiveStrategy,
  });

  const strategyId = activeStrategyQuery.data?.id;

  const reportsQuery = useQuery({
    queryKey: reportsQueryKey(strategyId ?? ""),
    queryFn: () => fetchReportsList(strategyId!),
    enabled: Boolean(strategyId),
  });

  const reportsByYmd = React.useMemo(() => {
    const list = reportsQuery.data ?? [];
    const map = new Map<string, (typeof list)[0]>();
    for (const r of list) {
      map.set(reportDateToYmd(r.reportDate), r);
    }
    return map;
  }, [reportsQuery.data]);

  const grid = React.useMemo(
    () => buildCalendarGrid(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

  const goPrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayYear((y) => y - 1);
      setDisplayMonth(12);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayYear((y) => y + 1);
      setDisplayMonth(1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  const effectiveSelected = today;

  return (
    <div className="flex flex-col gap-6">
      <SidebarTrigger className="-ml-2" />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {activeStrategyQuery.isLoading || !strategyId ? (
          <p className="text-sm text-muted-foreground">
            {activeStrategyQuery.isLoading ? "Loading..." : "No active strategy."}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Month header */}
            <div className="flex w-full max-w-[56rem] items-center justify-between">
              <h2 className="text-lg font-medium">
                {formatMonthYear(displayYear, displayMonth)}
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="rounded p-1.5 hover:bg-muted"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="rounded p-1.5 hover:bg-muted"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Calendar grid - CSS Grid for uniform square cells */}
            <div className="w-fit overflow-x-auto rounded-lg border border-border">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(7, 8rem)",
                  width: "fit-content",
                }}
              >
                {/* Header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (d) => (
                    <div
                      key={d}
                      className="flex size-32 items-center justify-center border-b border-r border-border bg-muted/50 text-base font-medium last:border-r-0"
                    >
                      {d}
                    </div>
                  ),
                )}
                {/* Cells - fixed 64x64px for uniform squares */}
                {grid.flat().map((cell) => {
                  const report = reportsByYmd.get(cell.ymd);
                  const isFuture = cell.ymd > today;
                  const isSelected = cell.ymd === effectiveSelected;
                  const hasReport = Boolean(report);
                  const rulesBroken =
                    (report?.brokenRuleIds?.length ?? 0) > 0;
                  const bgColor = hasReport
                    ? rulesBroken
                      ? "bg-red-500/20"
                      : "bg-green-500/20"
                    : "bg-transparent";

                  return (
                    <div
                      key={cell.ymd}
                      className="size-32 border-b border-r border-border p-1 last:border-r-0"
                    >
                      <Link
                        href={
                          isFuture ? "#" : `/report?date=${cell.ymd}`
                        }
                        onClick={(e) => {
                          if (isFuture) e.preventDefault();
                        }}
                        className={cn(
                          "flex size-full flex-col items-center justify-center gap-0.5 rounded-md text-center transition-colors",
                          bgColor,
                          isFuture && "cursor-not-allowed opacity-50",
                          isSelected &&
                            "ring-2 ring-primary ring-offset-1 ring-offset-background",
                        )}
                      >
                        <span
                          className={cn(
                            "whitespace-nowrap text-lg leading-tight",
                            !cell.isCurrentMonth && "text-muted-foreground",
                          )}
                        >
                          {formatShortDate(cell.ymd)}
                        </span>
                        {hasReport && (
                          <span
                            className={cn(
                              "text-sm font-medium leading-tight",
                              report!.pnl >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400",
                            )}
                          >
                            {formatPnl(report!.pnl)}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-green-500" />
                Rules followed
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-500" />
                Rules broken
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
