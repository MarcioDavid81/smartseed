import { IndustryHarvest } from "@prisma/client";

export interface IndustryStockWithProduct {
  quantity: number;
  industryProduct: {
    id: string;
    name: string;
  };
}

export interface IndustryDeposit {
  id: string;
  name: string;
  industryHarvests: IndustryHarvest[];
  industryStocks: IndustryStockWithProduct[];
  companyId: string;
}