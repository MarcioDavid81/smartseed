/*
  Warnings:

  - You are about to drop the column `userId` on the `Cultivar` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Cultivar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cultivar" DROP COLUMN "userId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Cultivar" ADD CONSTRAINT "Cultivar_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
