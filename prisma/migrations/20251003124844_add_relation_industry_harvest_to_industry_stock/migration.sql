/*
  Warnings:

  - You are about to drop the column `truckDiver` on the `IndustryHarvest` table. All the data in the column will be lost.
  - Added the required column `industryStockId` to the `IndustryHarvest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndustryHarvest" DROP COLUMN "truckDiver",
ADD COLUMN     "document" TEXT,
ADD COLUMN     "industryStockId" TEXT NOT NULL,
ADD COLUMN     "truckDriver" TEXT;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_industryStockId_fkey" FOREIGN KEY ("industryStockId") REFERENCES "IndustryStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
