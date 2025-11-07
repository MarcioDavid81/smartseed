import { ProductType } from "@prisma/client";

export interface IndustryHarvest {
  id: string;
  date: Date;
  document?: string;
  product: ProductType;
  talhaoId: string;
  talhao: {
    id: string;
    name: string;
    farm: {
      id: string;
      name: string;
    };
  };
  industryDepositId: string;
  industryDeposit: {
    id: string;
    name: string;
  };
  industryTransporterId: string;
  industryTransporter: {
    id: string;
    name: string;
  };
  truckPlate?: string;
  truckDriver?: string;
  weightBt: number;
  weightTr: number;
  weightSubLiq: number;
  humidity_percent: number;
  humidity_discount: number;
  humidity_kg: number;
  impurities_percent: number;
  impurities_discount: number;
  impurities_kg: number;
  tax_kg?: number;
  adjust_kg?: number;
  weightLiq: number;
  companyId: string;
}