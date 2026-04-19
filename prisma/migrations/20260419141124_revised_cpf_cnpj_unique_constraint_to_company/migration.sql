/*
  Warnings:

  - A unique constraint covering the columns `[cpf_cnpj,companyId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf_cnpj,companyId]` on the table `IndustryTransporter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_cpf_cnpj_key";

-- DropIndex
DROP INDEX "IndustryTransporter_cpf_cnpj_key";

-- AlterTable
ALTER TABLE "SeedStockAdjustment" ADD COLUMN     "cycleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cpf_cnpj_companyId_key" ON "Customer"("cpf_cnpj", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTransporter_cpf_cnpj_companyId_key" ON "IndustryTransporter"("cpf_cnpj", "companyId");

-- AddForeignKey
ALTER TABLE "SeedStockAdjustment" ADD CONSTRAINT "SeedStockAdjustment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
