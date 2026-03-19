import type {
  CreateReportBody,
  ReportDto,
  UpdateReportBody,
} from "@/lib/types/api/reports";

type ReportResponse = { report: ReportDto };

export async function fetchReportForDate(
  strategyId: string,
  dateYmd: string,
): Promise<ReportDto | null> {
  const params = new URLSearchParams({ date: dateYmd });
  const res = await fetch(
    `/api/strategies/${strategyId}/reports?${params.toString()}`,
    { method: "GET" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load report");
  const data = (await res.json()) as ReportResponse;
  return data.report;
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
