import { z } from "zod";

const dateYmdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/);

export const GetReportsQuerySchema = z.object({
  date: dateYmdSchema.optional(),
});

export const CreateReportBodySchema = z.object({
  reportDate: dateYmdSchema,
  pnl: z.union([z.string().min(1), z.number()]),
  notes: z.string().trim().nullable().optional(),
});

export const UpdateReportBodySchema = z
  .object({
    reportDate: dateYmdSchema.optional(),
    pnl: z.union([z.string().min(1), z.number()]).optional(),
    notes: z.string().trim().nullable().optional(),
  })
  .refine(
    (v) => Object.keys(v).some((k) => v[k as keyof typeof v] !== undefined),
    { message: "At least one field is required" },
  );

