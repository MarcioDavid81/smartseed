/*
  Warnings:

  - You are about to drop the column `purchaseOrderId` on the `Buy` table. All the data in the column will be lost.
  - You are about to drop the column `saleContractId` on the `IndustrySale` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseOrderId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `cultivarId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `fulfilledQuantity` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `unityPrice` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `cultivarId` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `fulfilledQuantity` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `unityPrice` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to drop the column `saleContractId` on the `SaleExit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Buy" DROP CONSTRAINT "Buy_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "IndustrySale" DROP CONSTRAINT "IndustrySale_saleContractId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_cultivarId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_productId_fkey";

-- DropForeignKey
ALTER TABLE "SaleContract" DROP CONSTRAINT "SaleContract_cultivarId_fkey";

-- DropForeignKey
ALTER TABLE "SaleExit" DROP CONSTRAINT "SaleExit_saleContractId_fkey";

-- AlterTable
ALTER TABLE "Buy" DROP COLUMN "purchaseOrderId",
ADD COLUMN     "purchaseOrderItemId" TEXT;

-- AlterTable
ALTER TABLE "IndustrySale" DROP COLUMN "saleContractId",
ADD COLUMN     "saleContractItemId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "purchaseOrderId",
ADD COLUMN     "purchaseOrderItemId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "cultivarId",
DROP COLUMN "description",
DROP COLUMN "fulfilledQuantity",
DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "totalPrice",
DROP COLUMN "type",
DROP COLUMN "unit",
DROP COLUMN "unityPrice";

-- AlterTable
ALTER TABLE "SaleContract" DROP COLUMN "cultivarId",
DROP COLUMN "description",
DROP COLUMN "fulfilledQuantity",
DROP COLUMN "product",
DROP COLUMN "quantity",
DROP COLUMN "totalPrice",
DROP COLUMN "type",
DROP COLUMN "unit",
DROP COLUMN "unityPrice";

-- AlterTable
ALTER TABLE "SaleExit" DROP COLUMN "saleContractId",
ADD COLUMN     "saleContractItemId" TEXT;

-- CreateTable
CREATE TABLE "SaleContractItem" (
    "id" TEXT NOT NULL,
    "saleContractId" TEXT NOT NULL,
    "type" "SaleContractType" NOT NULL,
    "product" "ProductType",
    "cultivarId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit" "Unit" NOT NULL,
    "unityPrice" DECIMAL(12,4) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "fulfilledQuantity" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleContractItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "type" "PurchaseOrderType" NOT NULL,
    "productId" TEXT,
    "cultivarId" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit" "Unit" NOT NULL,
    "unityPrice" DECIMAL(12,4) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "fulfilledQuantity" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_saleContractItemId_fkey" FOREIGN KEY ("saleContractItemId") REFERENCES "SaleContractItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_saleContractItemId_fkey" FOREIGN KEY ("saleContractItemId") REFERENCES "SaleContractItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContractItem" ADD CONSTRAINT "SaleContractItem_saleContractId_fkey" FOREIGN KEY ("saleContractId") REFERENCES "SaleContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContractItem" ADD CONSTRAINT "SaleContractItem_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
