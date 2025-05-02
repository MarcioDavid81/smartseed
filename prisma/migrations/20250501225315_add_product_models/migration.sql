-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SOJA', 'TRIGO', 'MILHO', 'AVEIA_BRANCA', 'AVEIA_PRETA', 'AVEIA_UCRANIANA', 'AZEVEM');

-- CreateTable
CREATE TABLE "Cultivar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "product" "ProductType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cultivar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawEntry" (
    "id" TEXT NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "origin" TEXT,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiation" (
    "id" TEXT NOT NULL,
    "rawEntryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "inputKg" DOUBLE PRECISION NOT NULL,
    "outputKg" DOUBLE PRECISION NOT NULL,
    "wasteKg" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalStock" (
    "id" TEXT NOT NULL,
    "beneficiationId" TEXT NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "availableKg" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinalStock_beneficiationId_key" ON "FinalStock"("beneficiationId");

-- AddForeignKey
ALTER TABLE "RawEntry" ADD CONSTRAINT "RawEntry_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiation" ADD CONSTRAINT "Beneficiation_rawEntryId_fkey" FOREIGN KEY ("rawEntryId") REFERENCES "RawEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalStock" ADD CONSTRAINT "FinalStock_beneficiationId_fkey" FOREIGN KEY ("beneficiationId") REFERENCES "Beneficiation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
