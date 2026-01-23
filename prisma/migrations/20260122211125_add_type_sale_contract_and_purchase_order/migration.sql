/*
  Warnings:

  - You are about to drop the column `type` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `SaleContractItem` table. All the data in the column will be lost.
  - Added the required column `type` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SaleContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "type" "PurchaseOrderType" NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "SaleContract" ADD COLUMN     "type" "SaleContractType" NOT NULL;

-- AlterTable
ALTER TABLE "SaleContractItem" DROP COLUMN "type";
