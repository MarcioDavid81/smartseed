-- AlterTable
ALTER TABLE "AccountPayable" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "AccountReceivable" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "FuelPurchase" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "IndustrySale" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "SaleContract" ADD COLUMN     "memberAdressId" TEXT;

-- AlterTable
ALTER TABLE "SaleExit" ADD COLUMN     "memberAdressId" TEXT;

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelPurchase" ADD CONSTRAINT "FuelPurchase_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_memberAdressId_fkey" FOREIGN KEY ("memberAdressId") REFERENCES "MemberAdress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
