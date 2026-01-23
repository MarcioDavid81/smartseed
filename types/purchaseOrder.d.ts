import { ComercialStatus, ProductClass, PurchaseOrderType, Unit } from "@prisma/client";
import { PurchaseOrderItem } from "./purchaseOrderItem";

export interface PurchaseOrder {
  id: string;
  type: PurchaseOrderType;
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