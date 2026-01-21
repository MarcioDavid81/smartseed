-- CreateEnum
CREATE TYPE "ComercialStatus" AS ENUM ('OPEN', 'PARTIAL_FULFILLED', 'FULFILLED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SaleContractType" AS ENUM ('SEED_SALE', 'INDUSTRY_SALE');

-- CreateEnum
CREATE TYPE "PurchaseOrderType" AS ENUM ('SEED_PURCHASE', 'INPUT_PURCHASE');

-- DropEnum
DROP TYPE "ContractOperationType";
