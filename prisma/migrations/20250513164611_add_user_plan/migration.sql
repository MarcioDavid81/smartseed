-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('BASIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan" DEFAULT 'BASIC';
