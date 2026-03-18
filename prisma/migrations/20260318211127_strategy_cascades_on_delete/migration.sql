-- DropForeignKey
ALTER TABLE "BrokenRule" DROP CONSTRAINT "BrokenRule_reportId_fkey";

-- DropForeignKey
ALTER TABLE "BrokenRule" DROP CONSTRAINT "BrokenRule_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "Rule" DROP CONSTRAINT "Rule_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "StrategyRule" DROP CONSTRAINT "StrategyRule_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "StrategyRule" DROP CONSTRAINT "StrategyRule_strategyId_fkey";

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyRule" ADD CONSTRAINT "StrategyRule_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyRule" ADD CONSTRAINT "StrategyRule_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokenRule" ADD CONSTRAINT "BrokenRule_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokenRule" ADD CONSTRAINT "BrokenRule_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
