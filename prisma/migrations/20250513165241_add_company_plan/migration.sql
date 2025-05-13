/*
  Warnings:

  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "plan" "Plan" DEFAULT 'BASIC';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan";
