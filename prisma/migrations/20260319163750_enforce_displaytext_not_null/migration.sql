/*
  Warnings:

  - Made the column `displayText` on table `StrategyRule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StrategyRule" ALTER COLUMN "displayText" SET NOT NULL;
