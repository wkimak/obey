/**
 * Calendar dates for reports use YYYY-MM-DD as the source of truth (wall-clock date,
 * not shifted by timezone when building the string from a local Date).
 */

export function localDateToYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ymdToLocalNoonDate(ymd: string): Date {
  const [y, m, day] = ymd.split("-").map(Number);
  if (!y || !m || !day) return new Date(NaN);
  return new Date(y, m - 1, day, 12, 0, 0, 0);
}

export function todayLocalYmd(): string {
  return localDateToYmd(new Date());
}

function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

/** e.g. "March 19th, 2026" */
export function formatReportDateLabel(ymd: string): string {
  const d = ymdToLocalNoonDate(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `${month} ${ordinal(d.getDate())}, ${year}`;
}
