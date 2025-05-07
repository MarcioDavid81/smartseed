-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('Colheita', 'Compra', 'Descarte', 'Venda', 'Plantio');

-- AlterTable
ALTER TABLE "Beneficiation" ADD COLUMN     "type" "OperationType" NOT NULL DEFAULT 'Descarte';

-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "type" "OperationType" NOT NULL DEFAULT 'Compra';

-- AlterTable
ALTER TABLE "ConsumptionExit" ADD COLUMN     "type" "OperationType" NOT NULL DEFAULT 'Plantio';

-- AlterTable
ALTER TABLE "Harvest" ADD COLUMN     "type" "OperationType" NOT NULL DEFAULT 'Colheita';

-- AlterTable
ALTER TABLE "SaleExit" ADD COLUMN     "type" "OperationType" NOT NULL DEFAULT 'Venda';
