import { ComercialStatus, ProductType, PurchaseOrderType, SaleContractItem, Unit } from "@prisma/client";

export interface SaleContract {
  id: string;
  date: Date;
  document?: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
  };
  notes?: string;
  status: ComercialStatus;
  items: SaleContractItem[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}