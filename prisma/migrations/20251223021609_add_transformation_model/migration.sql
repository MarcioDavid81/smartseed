-- CreateTable
CREATE TABLE "Transformation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cultivarId" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "destinationId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "OperationType" NOT NULL DEFAULT 'Transformacao',

    CONSTRAINT "Transformation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transformation" ADD CONSTRAINT "Transformation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transformation" ADD CONSTRAINT "Transformation_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transformation" ADD CONSTRAINT "Transformation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "IndustryDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
