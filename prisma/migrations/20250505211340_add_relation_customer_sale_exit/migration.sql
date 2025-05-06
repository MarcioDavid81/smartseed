/*
  Warnings:

  - You are about to drop the column `supplier` on the `Buy` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `Buy` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Customer_email_key";

-- AlterTable
ALTER TABLE "Buy" DROP COLUMN "supplier",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
