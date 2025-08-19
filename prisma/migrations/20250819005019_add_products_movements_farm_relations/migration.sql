/*
  Warnings:

  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `farmId` on the `TransferExit` table. All the data in the column will be lost.
  - Added the required column `farmId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destFarmId` to the `TransferExit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originFarmId` to the `TransferExit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TransferExit" DROP CONSTRAINT "TransferExit_farmId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "farmId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TransferExit" DROP COLUMN "farmId",
ADD COLUMN     "destFarmId" TEXT NOT NULL,
ADD COLUMN     "originFarmId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProductStock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductStock_productId_farmId_key" ON "ProductStock"("productId", "farmId");

-- AddForeignKey
ALTER TABLE "ProductStock" ADD CONSTRAINT "ProductStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStock" ADD CONSTRAINT "ProductStock_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStock" ADD CONSTRAINT "ProductStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferExit" ADD CONSTRAINT "TransferExit_originFarmId_fkey" FOREIGN KEY ("originFarmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferExit" ADD CONSTRAINT "TransferExit_destFarmId_fkey" FOREIGN KEY ("destFarmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
