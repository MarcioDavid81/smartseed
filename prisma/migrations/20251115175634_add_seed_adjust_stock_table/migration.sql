-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('Increase', 'Decrease');

-- CreateTable
CREATE TABLE "SeedStockAdjustment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedStockAdjustment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SeedStockAdjustment" ADD CONSTRAINT "SeedStockAdjustment_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedStockAdjustment" ADD CONSTRAINT "SeedStockAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
