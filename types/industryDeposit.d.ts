import { IndustryHarvest, ProductType } from "@prisma/client";

export interface IndustryStockWithProduct {
  quantity: number;
  product: ProductType;
}

export interface IndustryDeposit {
  id: string;
  name: string;
  industryHarvests: IndustryHarvest[];
  industryStocks: IndustryStockWithProduct[];
  companyId: string;
}