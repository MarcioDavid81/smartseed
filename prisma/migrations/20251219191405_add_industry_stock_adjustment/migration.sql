/*
  Warnings:

  - The `type` column on the `SeedStockAdjustment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "OperationType" ADD VALUE 'Ajuste';

-- AlterTable
ALTER TABLE "SeedStockAdjustment" DROP COLUMN "type",
ADD COLUMN     "type" "OperationType" NOT NULL;

-- DropEnum
DROP TYPE "AdjustmentType";

-- CreateTable
CREATE TABLE "IndustryStockAdjustment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityKg" DECIMAL(12,2) NOT NULL,
    "product" "ProductType" NOT NULL,
    "industryDepositId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "IndustryStockAdjustment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IndustryStockAdjustment" ADD CONSTRAINT "IndustryStockAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryStockAdjustment" ADD CONSTRAINT "IndustryStockAdjustment_industryDepositId_fkey" FOREIGN KEY ("industryDepositId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
