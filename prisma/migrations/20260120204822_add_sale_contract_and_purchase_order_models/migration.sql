-- AlterTable
ALTER TABLE "Buy" ADD COLUMN     "purchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "IndustrySale" ADD COLUMN     "saleContractId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "purchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "SaleExit" ADD COLUMN     "saleContractId" TEXT;

-- CreateTable
CREATE TABLE "SaleContract" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "document" TEXT,
    "customerId" TEXT NOT NULL,
    "notes" TEXT,
    "quantityKg" DECIMAL(12,2) NOT NULL,
    "unityPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "type" "SaleContractType" NOT NULL,
    "product" "ProductType",
    "cultivarId" TEXT,
    "status" "ComercialStatus" NOT NULL DEFAULT 'OPEN',
    "fulfilledQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "SaleContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "document" TEXT,
    "customerId" TEXT NOT NULL,
    "notes" TEXT,
    "quantityKg" DECIMAL(12,2) NOT NULL,
    "unityPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "type" "PurchaseOrderType" NOT NULL,
    "productId" TEXT,
    "cultivarId" TEXT,
    "status" "ComercialStatus" NOT NULL DEFAULT 'OPEN',
    "fulfilledQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Buy" ADD CONSTRAINT "Buy_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleExit" ADD CONSTRAINT "SaleExit_saleContractId_fkey" FOREIGN KEY ("saleContractId") REFERENCES "SaleContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySale" ADD CONSTRAINT "IndustrySale_saleContractId_fkey" FOREIGN KEY ("saleContractId") REFERENCES "SaleContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_cultivarId_fkey" FOREIGN KEY ("cultivarId") REFERENCES "Cultivar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
