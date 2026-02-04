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
  deliveries: Array<{
    id: string;
    date: string;
    invoice: string;
    quantity: number;
    unit: Unit;
    totalPrice: number;
  }>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}