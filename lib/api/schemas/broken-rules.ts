import { z } from "zod";

export const ReplaceBrokenRulesBodySchema = z.object({
  brokenRuleIds: z.array(z.string().min(1)).min(0),
});

