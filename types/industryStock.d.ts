import { ProductType } from "@prisma/client";

export interface IndustryStock {
  id: string;
  product: ProductType;
  industryDepositId: string;
  industryDeposit: {
    id: string;
    name: string;
  };
  quantity: number;
  companyId: string;
}