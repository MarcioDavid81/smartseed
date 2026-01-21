import { ComercialStatus, ProductClass, PurchaseOrderItem, PurchaseOrderType, Unit } from "@prisma/client";

export interface PurchaseOrder {
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
  items: PurchaseOrderItem[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}