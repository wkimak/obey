import { z } from "zod";

// `section` can be `null` (DB column is nullable).
// `displayText` should never be `null` (sent as empty string if blank).
const nullableString = z.string().trim().min(1).nullable();
const nonNullableString = z.string().trim();

export const StrategyRuleExistingSchema = z.object({
  ruleId: z.string().min(1),
  section: nullableString,
  displayText: nonNullableString,
  displayOrder: z.number().int().nonnegative(),
});

export const StrategyRuleNewSchema = z.object({
  title: z.string().trim().min(1),
  key: z.string().trim().min(1).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  section: nullableString,
  displayText: nonNullableString,
  displayOrder: z.number().int().nonnegative(),
});

export const StrategyRulesItemSchema = z.union([
  StrategyRuleExistingSchema,
  StrategyRuleNewSchema,
]);

export const CreateStrategyBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  rules: z.array(StrategyRulesItemSchema).min(1),
});

export const ArchiveStrategyBodySchema = z.object({
  archived: z.boolean(),
});

export const SetActiveStrategyBodySchema = z.object({
  strategyId: z.string().min(1),
});

