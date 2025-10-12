-- AlterTable
ALTER TABLE "ConsumptionExit" ADD COLUMN     "talhaoId" TEXT;

-- AddForeignKey
ALTER TABLE "ConsumptionExit" ADD CONSTRAINT "ConsumptionExit_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
