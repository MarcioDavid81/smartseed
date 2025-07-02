-- CreateEnum
CREATE TYPE "CultivarStatus" AS ENUM ('BENEFICIANDO', 'BENEFICIADO');

-- AlterTable
ALTER TABLE "Cultivar" ADD COLUMN     "status" "CultivarStatus" NOT NULL DEFAULT 'BENEFICIANDO';
