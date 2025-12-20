import { ProductType } from "@prisma/client";

export interface IndustryAdjustStock {
  id: string;
  date: Date;
  quantityKg: number;
  product: ProductType;
  industryDepositId: string;
  industryDeposit: {
    id: string;
    name: string;
  };
  companyId: string;
  notes?: string;
}