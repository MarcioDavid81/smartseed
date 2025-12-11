/*
  Warnings:

  - A unique constraint covering the columns `[maintenanceId]` on the table `AccountPayable` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fuelPurchaseId]` on the table `AccountPayable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('TRACTOR', 'COMBINE', 'SPRAYER', 'TRUCK', 'PICKUP', 'IMPLEMENT', 'OTHER');

-- AlterTable
ALTER TABLE "AccountPayable" ADD COLUMN     "fuelPurchaseId" TEXT,
ADD COLUMN     "maintenanceId" TEXT;

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MachineType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "plate" TEXT,
    "serialNumber" TEXT,
    "hourmeter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "odometer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelTank" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelTank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelPurchase" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "paymentCondition" "PaymentCondition",
    "dueDate" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refuel" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DOUBLE PRECISION NOT NULL,
    "hourmeter" DOUBLE PRECISION,
    "odometer" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "paymentCondition" "PaymentCondition" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountPayable_maintenanceId_key" ON "AccountPayable"("maintenanceId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountPayable_fuelPurchaseId_key" ON "AccountPayable"("fuelPurchaseId");

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_fuelPurchaseId_fkey" FOREIGN KEY ("fuelPurchaseId") REFERENCES "FuelPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelTank" ADD CONSTRAINT "FuelTank_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelPurchase" ADD CONSTRAINT "FuelPurchase_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelPurchase" ADD CONSTRAINT "FuelPurchase_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "FuelTank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelPurchase" ADD CONSTRAINT "FuelPurchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuel" ADD CONSTRAINT "Refuel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuel" ADD CONSTRAINT "Refuel_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "FuelTank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuel" ADD CONSTRAINT "Refuel_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
