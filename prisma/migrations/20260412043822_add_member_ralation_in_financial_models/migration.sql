-- AlterTable
ALTER TABLE "AccountPayable" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "AccountReceivable" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "FuelPurchase" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "IndustrySale" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "SaleContract" ADD COLUMN     "memberId" TEXT;

-- AlterTable
ALTER TABLE "SaleExit" ADD COLUMN     "memberId" TEXT;

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelPurchase" ADD CONSTRAINT "FuelPurchase_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
