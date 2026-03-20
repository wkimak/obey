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

/** First and last YYYY-MM-DD of the given month (year, 1-based month). */
export function getMonthBounds(year: number, month: number): {
  start: string;
  end: string;
} {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day of month
  return {
    start: localDateToYmd(start),
    end: localDateToYmd(end),
  };
}

/** Build calendar grid for a month. Sun=0. Each cell has { ymd, isCurrentMonth }. */
export function buildCalendarGrid(year: number, month: number): {
  ymd: string;
  isCurrentMonth: boolean;
}[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startSun = new Date(first);
  startSun.setDate(first.getDate() - first.getDay());
  const endSat = new Date(last);
  endSat.setDate(last.getDate() + (6 - last.getDay()));
  const rows: { ymd: string; isCurrentMonth: boolean }[][] = [];
  const cur = new Date(startSun);
  while (cur <= endSat) {
    const week: { ymd: string; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const ymd = localDateToYmd(cur);
      const isCurrentMonth =
        cur.getMonth() === month - 1 && cur.getFullYear() === year;
      week.push({ ymd, isCurrentMonth });
      cur.setDate(cur.getDate() + 1);
    }
    rows.push(week);
  }
  return rows;
}

/** e.g. "March 2026" */
export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

/** e.g. "Mar 20" for calendar cells */
export function formatShortDate(ymd: string): string {
  const d = ymdToLocalNoonDate(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** e.g. "March 19th, 2026" */
export function formatReportDateLabel(ymd: string): string {
  const d = ymdToLocalNoonDate(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `${month} ${ordinal(d.getDate())}, ${year}`;
}
