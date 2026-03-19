import { HttpError } from "@/lib/api/errors";

/**
 * Reject YYYY-MM-DD strictly after the server's current UTC calendar day.
 * (Client UI also caps selection by local calendar day.)
 */
export function assertReportDateNotInFuture(ymd: string): void {
  const todayUtc = new Date().toISOString().slice(0, 10);
  if (ymd > todayUtc) {
    throw new HttpError(400, "Report date cannot be in the future");
  }
}
