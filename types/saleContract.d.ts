import { ComercialStatus, ProductType, PurchaseOrderType, SaleContractType, Unit } from "@prisma/client";
import { SaleContractItem } from "./saleContractItem";

export interface SaleContract {
  id: string;
  type: SaleContractType;
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