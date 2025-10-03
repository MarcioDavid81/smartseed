import { IndustryHarvest, IndustryStock } from "@prisma/client";

export interface IndustryDeposit {
  id: string;
  date: Date;
  industryHarvests: IndustryHarvest[];
  industryStocks: IndustryStock[];
  companyId: string;
}