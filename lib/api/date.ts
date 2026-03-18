import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((val) => {
    // Interpret as UTC midnight.
    const start = new Date(`${val}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) return val;
    return start;
  })
  .refine((d) => d instanceof Date, { message: "Invalid date" });

export function startOfUtcDay(date: Date) {
  return new Date(date.toISOString().slice(0, 10) + "T00:00:00.000Z");
}

export function endOfUtcDay(date: Date) {
  const start = startOfUtcDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

