import { IndustryHarvest, IndustryStock } from "@prisma/client";

export interface IndustryProduct {
  id: string;
  name: string;
  industryHarvests: IndustryHarvest[];
  industryStocks: IndustryStock[];
  companyId: string;
}