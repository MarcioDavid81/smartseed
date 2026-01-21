/*
  Warnings:

  - You are about to drop the column `quantityKg` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to alter the column `unityPrice` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `fulfilledQuantity` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to drop the column `quantityKg` on the `SaleContract` table. All the data in the column will be lost.
  - You are about to alter the column `unityPrice` on the `SaleContract` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `fulfilledQuantity` on the `SaleContract` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - Added the required column `quantity` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `SaleContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `SaleContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "quantityKg",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "quantity" DECIMAL(12,4) NOT NULL,
ADD COLUMN     "unit" "Unit" NOT NULL,
ALTER COLUMN "unityPrice" SET DATA TYPE DECIMAL(12,4),
ALTER COLUMN "fulfilledQuantity" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "SaleContract" DROP COLUMN "quantityKg",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "quantity" DECIMAL(12,4) NOT NULL,
ADD COLUMN     "unit" "Unit" NOT NULL,
ALTER COLUMN "unityPrice" SET DATA TYPE DECIMAL(12,4),
ALTER COLUMN "fulfilledQuantity" SET DATA TYPE DECIMAL(12,4);
