/*
  Warnings:

  - You are about to drop the column `productId` on the `IndustryHarvest` table. All the data in the column will be lost.
  - You are about to drop the column `industryProductId` on the `IndustryStock` table. All the data in the column will be lost.
  - You are about to drop the `IndustryProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[product,industryDepositId]` on the table `IndustryStock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product` to the `IndustryHarvest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product` to the `IndustryStock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IndustryHarvest" DROP CONSTRAINT "IndustryHarvest_productId_fkey";

-- DropForeignKey
ALTER TABLE "IndustryProduct" DROP CONSTRAINT "IndustryProduct_companyId_fkey";

-- DropForeignKey
ALTER TABLE "IndustryStock" DROP CONSTRAINT "IndustryStock_industryProductId_fkey";

-- DropIndex
DROP INDEX "IndustryStock_industryProductId_industryDepositId_key";

-- AlterTable
ALTER TABLE "IndustryHarvest" DROP COLUMN "productId",
ADD COLUMN     "product" "ProductType" NOT NULL;

-- AlterTable
ALTER TABLE "IndustryStock" DROP COLUMN "industryProductId",
ADD COLUMN     "product" "ProductType" NOT NULL;

-- DropTable
DROP TABLE "IndustryProduct";

-- CreateIndex
CREATE UNIQUE INDEX "IndustryStock_product_industryDepositId_key" ON "IndustryStock"("product", "industryDepositId");
