-- AlterTable
ALTER TABLE "Beneficiation" ADD COLUMN     "cycleId" TEXT;

-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "cycleId" TEXT;

-- AlterTable
ALTER TABLE "ConsumptionExit" ADD COLUMN     "cycleId" TEXT;

-- AlterTable
ALTER TABLE "Harvest" ADD COLUMN     "cycleId" TEXT;

-- AlterTable
ALTER TABLE "SaleExit" ADD COLUMN     "cycleId" TEXT;

-- CreateTable
CREATE TABLE "ProductionCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionCycle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiation" ADD CONSTRAINT "Beneficiation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionExit" ADD CONSTRAINT "ConsumptionExit_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionCycle" ADD CONSTRAINT "ProductionCycle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
