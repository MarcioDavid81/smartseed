/*
  Warnings:

  - Made the column `stock` on table `Cultivar` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cultivar" ALTER COLUMN "stock" SET NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 0;
