/*
  Warnings:

  - You are about to drop the column `farmId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `TransferExit` table. All the data in the column will be lost.
  - Added the required column `productStockId` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_farmId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_productId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "farmId",
DROP COLUMN "productId",
DROP COLUMN "unit",
ADD COLUMN     "productStockId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TransferExit" DROP COLUMN "unit";

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_productStockId_fkey" FOREIGN KEY ("productStockId") REFERENCES "ProductStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
