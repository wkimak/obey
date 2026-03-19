-- One report per strategy per calendar day (reportDate stored as UTC midnight for that Y-M-D).
DROP INDEX IF EXISTS "Report_userId_reportDate_key";

CREATE UNIQUE INDEX "Report_strategyId_reportDate_key" ON "Report"("strategyId", "reportDate");
