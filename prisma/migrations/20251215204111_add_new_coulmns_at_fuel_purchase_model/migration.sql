/*
  Warnings:

  - Added the required column `unitPrice` to the `FuelPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FuelPurchase" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Maintenance" ALTER COLUMN "dueDate" DROP NOT NULL;
