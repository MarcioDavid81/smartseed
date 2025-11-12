-- AlterTable
ALTER TABLE "Beneficiation" ADD COLUMN     "destinationId" TEXT;

-- AddForeignKey
ALTER TABLE "Beneficiation" ADD CONSTRAINT "Beneficiation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "IndustryDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
