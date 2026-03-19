export type ReportDto = {
  id: string;
  userId: string;
  strategyId: string;
  /** ISO timestamp (UTC midnight for the report calendar day) */
  reportDate: string;
  pnl: number;
  notes: string | null;
  brokenRuleIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateReportBody = {
  reportDate: string;
  pnl: string | number;
  notes?: string | null;
};

export type UpdateReportBody = {
  reportDate?: string;
  pnl?: string | number;
  notes?: string | null;
};
