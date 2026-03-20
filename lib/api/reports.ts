import type {
  CreateReportBody,
  ReportDto,
  UpdateReportBody,
} from "@/lib/types/api/reports";

type ReportResponse = { report: ReportDto };
type ReportsListResponse = { reports: ReportDto[] };

export async function fetchReportsList(
  strategyId: string,
): Promise<ReportDto[]> {
  const res = await fetch(`/api/strategies/${strategyId}/reports`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load reports");
  const data = (await res.json()) as ReportsListResponse;
  return data.reports ?? [];
}

export async function fetchReportForDate(
  strategyId: string,
  dateYmd: string,
): Promise<ReportDto | null> {
  const params = new URLSearchParams({ date: dateYmd });
  const res = await fetch(
    `/api/strategies/${strategyId}/reports?${params.toString()}`,
    { method: "GET", cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load report");
  const data = (await res.json()) as ReportResponse & { reports?: ReportDto[] };
  if (data && typeof data === "object" && "report" in data && data.report) {
    return data.report;
  }
  // Defensive: if the date query was dropped and the API returned a list, pick by day.
  if (data && typeof data === "object" && Array.isArray(data.reports)) {
    const match = data.reports.find(
      (r) => r.reportDate.slice(0, 10) === dateYmd,
    );
    return match ?? null;
  }
  throw new Error("Failed to load report: unexpected response");
}

export async function createReport(
  strategyId: string,
  body: CreateReportBody,
): Promise<ReportDto> {
  const res = await fetch(`/api/strategies/${strategyId}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? "Failed to create report");
  }
  const data = (await res.json()) as ReportResponse;
  return data.report;
}

export async function updateReport(
  strategyId: string,
  reportId: string,
  body: UpdateReportBody,
): Promise<ReportDto> {
  const res = await fetch(
    `/api/strategies/${strategyId}/reports/${reportId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? "Failed to update report");
  }
  const data = (await res.json()) as ReportResponse;
  return data.report;
}

/** Replaces all broken-rule links for the report (full list, not incremental). */
export async function replaceBrokenRules(
  strategyId: string,
  reportId: string,
  brokenRuleIds: string[],
): Promise<string[]> {
  const res = await fetch(
    `/api/strategies/${strategyId}/reports/${reportId}/broken-rules`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brokenRuleIds }),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? "Failed to update broken rules");
  }
  const data = (await res.json()) as { brokenRuleIds: string[] };
  return data.brokenRuleIds;
}
