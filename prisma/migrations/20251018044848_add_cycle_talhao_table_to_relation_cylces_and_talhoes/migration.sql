-- CreateTable
CREATE TABLE "CycleTalhao" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleTalhao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CycleTalhao" ADD CONSTRAINT "CycleTalhao_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ProductionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleTalhao" ADD CONSTRAINT "CycleTalhao_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
