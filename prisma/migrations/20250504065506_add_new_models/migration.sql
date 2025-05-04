/*
  Warnings:

  - You are about to drop the column `inputKg` on the `Beneficiation` table. All the data in the column will be lost.
  - You are about to drop the column `outputKg` on the `Beneficiation` table. All the data in the column will be lost.
  - You are about to drop the column `rawEntryId` on the `Beneficiation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Beneficiation` table. All the data in the column will be lost.
  - You are about to drop the column `wasteKg` on the `Beneficiation` table. All the data in the column will be lost.
  - You are about to drop the `FinalStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RawEntry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `Beneficiation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cultivarId` to the `Beneficiation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityKg` to the `Beneficiation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Beneficiation" DROP CONSTRAINT "Beneficiation_rawEntryId_fkey";

-- DropForeignKey
ALTER TABLE "FinalStock" DROP CONSTRAINT "FinalStock_beneficiationId_fkey";

-- DropForeignKey
ALTER TABLE "RawEntry" DROP CONSTRAINT "RawEntry_cultivarId_fkey";

-- AlterTable
ALTER TABLE "Beneficiation" DROP COLUMN "inputKg",
DROP COLUMN "outputKg",
DROP COLUMN "rawEntryId",
DROP COLUMN "userId",
DROP COLUMN "wasteKg",
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "cultivarId" TEXT NOT NULL,
ADD COLUMN     "quantityKg" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "FinalStock";

-- DropTable
DROP TABLE "RawEntry";

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "adress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "phone" TEXT,
    "cpf_cnpj" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talhao" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Talhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" TEXT NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buy" (
    "id" TEXT NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "supplier" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumptionExit" (
    "id" TEXT NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "farmId" TEXT NOT NULL,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumptionExit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleExit" (
    "id" TEXT NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "customerId" TEXT,
    "invoiceNumber" TEXT,
    "saleValue" DOUBLE PRECISION,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleExit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cpf_cnpj_key" ON "Customer"("cpf_cnpj");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talhao" ADD CONSTRAINT "Talhao_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talhao" ADD CONSTRAINT "Talhao_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiation" ADD CONSTRAINT "Beneficiation_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiation" ADD CONSTRAINT "Beneficiation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionExit" ADD CONSTRAINT "ConsumptionExit_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionExit" ADD CONSTRAINT "ConsumptionExit_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionExit" ADD CONSTRAINT "ConsumptionExit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
