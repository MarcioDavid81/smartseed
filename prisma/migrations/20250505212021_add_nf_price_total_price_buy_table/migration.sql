/*
  Warnings:

  - Added the required column `invoice` to the `Buy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Buy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unityPrice` to the `Buy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "invoice" TEXT NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unityPrice" DOUBLE PRECISION NOT NULL;
