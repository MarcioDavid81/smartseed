import { ProductType } from "@prisma/client";

export interface IndustryHarvestDetails {
  id: string;
  date: Date;
  document?: string;
  product: ProductType;
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

  talhao: {
    name: string;
    farm: {
      name: string;
    };
  };

  industryDeposit: {
    name: string;
  };

  industryTransporter?: {
    name: string;
    cpf_cnpj: string;
    city: string;
    state: string;
    phone: string;
  };

  company: {
    name: string;
  };


}