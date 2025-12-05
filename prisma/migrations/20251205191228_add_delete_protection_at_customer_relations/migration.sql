-- DropForeignKey
ALTER TABLE "IndustryHarvest" DROP CONSTRAINT "IndustryHarvest_industryTransporterId_fkey";

-- DropForeignKey
ALTER TABLE "IndustrySale" DROP CONSTRAINT "IndustrySale_industryTransporterId_fkey";

-- DropForeignKey
ALTER TABLE "SaleExit" DROP CONSTRAINT "SaleExit_customerId_fkey";

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_industryTransporterId_fkey" FOREIGN KEY ("industryTransporterId") REFERENCES "IndustryTransporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_industryTransporterId_fkey" FOREIGN KEY ("industryTransporterId") REFERENCES "IndustryTransporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
