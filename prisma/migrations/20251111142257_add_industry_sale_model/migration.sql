/*
  Warnings:

  - A unique constraint covering the columns `[industrySaleId]` on the table `AccountReceivable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccountReceivable" ADD COLUMN     "industrySaleId" TEXT;

-- CreateTable
CREATE TABLE "IndustrySale" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document" TEXT,
    "product" "ProductType" NOT NULL,
    "industryDepositId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "industryTransporterId" TEXT,
    "truckPlate" TEXT,
    "truckDriver" TEXT,
    "weightBt" DECIMAL(12,2) NOT NULL,
    "weightTr" DECIMAL(12,2) NOT NULL,
    "weightSubLiq" DECIMAL(12,2) NOT NULL,
    "discountsKg" DECIMAL(12,2),
    "weightLiq" DECIMAL(12,2) NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "cycleId" TEXT,
    "paymentCondition" "PaymentCondition",
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndustrySale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountReceivable_industrySaleId_key" ON "AccountReceivable"("industrySaleId");

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_industrySaleId_fkey" FOREIGN KEY ("industrySaleId") REFERENCES "IndustrySale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_industryDepositId_fkey" FOREIGN KEY ("industryDepositId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_industryTransporterId_fkey" FOREIGN KEY ("industryTransporterId") REFERENCES "IndustryTransporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
