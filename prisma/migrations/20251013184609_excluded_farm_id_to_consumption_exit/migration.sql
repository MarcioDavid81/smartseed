/*
  Warnings:

  - You are about to drop the column `farmId` on the `ConsumptionExit` table. All the data in the column will be lost.
  - Made the column `talhaoId` on table `ConsumptionExit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ConsumptionExit" DROP CONSTRAINT "ConsumptionExit_farmId_fkey";

-- DropForeignKey
ALTER TABLE "ConsumptionExit" DROP CONSTRAINT "ConsumptionExit_talhaoId_fkey";

-- AlterTable
ALTER TABLE "ConsumptionExit" DROP COLUMN "farmId",
ALTER COLUMN "talhaoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ConsumptionExit" ADD CONSTRAINT "ConsumptionExit_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
