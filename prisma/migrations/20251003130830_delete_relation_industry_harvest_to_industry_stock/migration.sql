/*
  Warnings:

  - You are about to drop the column `industryStockId` on the `IndustryHarvest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "IndustryHarvest" DROP CONSTRAINT "IndustryHarvest_industryStockId_fkey";

-- AlterTable
ALTER TABLE "IndustryHarvest" DROP COLUMN "industryStockId";
