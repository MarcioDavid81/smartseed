import { IndustryDeposit, ProductType } from "@prisma/client";

export interface industryTransfer {
  id: string;
  date: Date;
  product: ProductType;
  fromDepositId: string;
  fromDeposit: IndustryDeposit;
  toDepositId: string;
  toDeposit: IndustryDeposit;
  quantity: number;
  document?: string;
  observation?: string;
  companyId: string;
  cycleId?: string;
  createdAt: Date;
  updatedAt: Date;
}