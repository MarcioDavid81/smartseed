-- AlterTable
ALTER TABLE "IndustryDeposit" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "IndustryTransfer" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product" "ProductType" NOT NULL,
    "fromDepositId" TEXT NOT NULL,
    "toDepositId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "document" TEXT,
    "observation" TEXT,
    "companyId" TEXT NOT NULL,
    "cycleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryTransfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IndustryTransfer" ADD CONSTRAINT "IndustryTransfer_fromDepositId_fkey" FOREIGN KEY ("fromDepositId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTransfer" ADD CONSTRAINT "IndustryTransfer_toDepositId_fkey" FOREIGN KEY ("toDepositId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTransfer" ADD CONSTRAINT "IndustryTransfer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTransfer" ADD CONSTRAINT "IndustryTransfer_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
