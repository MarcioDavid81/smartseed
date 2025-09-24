-- CreateEnum
CREATE TYPE "PaymentCondition" AS ENUM ('AVISTA', 'APRAZO');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELED');

-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paymentCondition" "PaymentCondition";

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paymentCondition" "PaymentCondition";

-- AlterTable
ALTER TABLE "SaleExit" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paymentCondition" "PaymentCondition";

-- CreateTable
CREATE TABLE "AccountPayable" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "buyId" TEXT,
    "purchaseId" TEXT,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "AccountPayable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountReceivable" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "saleExitId" TEXT,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "AccountReceivable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountPayable_buyId_key" ON "AccountPayable"("buyId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountPayable_purchaseId_key" ON "AccountPayable"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountReceivable_saleExitId_key" ON "AccountReceivable"("saleExitId");

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_buyId_fkey" FOREIGN KEY ("buyId") REFERENCES "Buy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_saleExitId_fkey" FOREIGN KEY ("saleExitId") REFERENCES "SaleExit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
