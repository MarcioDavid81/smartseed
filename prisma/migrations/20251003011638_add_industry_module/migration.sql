-- CreateTable
CREATE TABLE "IndustryProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "IndustryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryDeposit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "IndustryDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryStock" (
    "id" TEXT NOT NULL,
    "industryProductId" TEXT NOT NULL,
    "industryDepositId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "IndustryStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTransporter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fantasyName" TEXT,
    "cpf_cnpj" TEXT,
    "adress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "IndustryTransporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryHarvest" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "industryDepositId" TEXT NOT NULL,
    "industryTransporterId" TEXT,
    "truckPlate" TEXT,
    "truckDiver" TEXT,
    "weightBt" DECIMAL(12,2) NOT NULL,
    "weightTr" DECIMAL(12,2) NOT NULL,
    "weightSubLiq" DECIMAL(12,2) NOT NULL,
    "humidity_percent" DECIMAL(5,2) NOT NULL,
    "humidity_discount" DECIMAL(12,2) NOT NULL,
    "humidity_kg" DECIMAL(12,2) NOT NULL,
    "impurities_percent" DECIMAL(5,2) NOT NULL,
    "impurities_discount" DECIMAL(12,2) NOT NULL,
    "impurities_kg" DECIMAL(12,2) NOT NULL,
    "weightLiq" DECIMAL(12,2) NOT NULL,
    "cycleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "IndustryHarvest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustryStock_industryProductId_industryDepositId_key" ON "IndustryStock"("industryProductId", "industryDepositId");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTransporter_cpf_cnpj_key" ON "IndustryTransporter"("cpf_cnpj");

-- AddForeignKey
ALTER TABLE "IndustryProduct" ADD CONSTRAINT "IndustryProduct_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryDeposit" ADD CONSTRAINT "IndustryDeposit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryStock" ADD CONSTRAINT "IndustryStock_industryProductId_fkey" FOREIGN KEY ("industryProductId") REFERENCES "IndustryProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryStock" ADD CONSTRAINT "IndustryStock_industryDepositId_fkey" FOREIGN KEY ("industryDepositId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryStock" ADD CONSTRAINT "IndustryStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTransporter" ADD CONSTRAINT "IndustryTransporter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "IndustryProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_industryDepositId_fkey" FOREIGN KEY ("industryDepositId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_industryTransporterId_fkey" FOREIGN KEY ("industryTransporterId") REFERENCES "IndustryTransporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryHarvest" ADD CONSTRAINT "IndustryHarvest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
