import {
  ComercialStatus,
  PurchaseOrderType,
  Unit,
} from "@prisma/client";
import { PurchaseOrderItemDelivery } from "./purchaseOrderItemDelivery";

export type PurchaseOrderDetails = {
  id: string;
  type: PurchaseOrderType;
  date: Date;
  document: string | null;
  status: ComercialStatus;
  notes: string | null;
  customerId: string;
  customer: {
    id: string;
    name: string;
  };

  items: Array<{
    id: string;
    description: string | null;
    quantity: number;
    fulfilledQuantity: number;
    remainingQuantity: number;
    unit: Unit;
    unityPrice: number;
    totalPrice: number;
    productId: string | null;
    product: {
      id: string;
      name: string;
    } | null;    
    cultivarId: string | null;
    cultivar: {
      id: string;
      name: string;
    } | null;

    deliveries: PurchaseOrderItemDelivery[];
  }>;

  deliveries: Array<{
    id: string;
    date: string;
    invoice: string;
    quantity: number;
    unit: Unit;
    totalPrice: number;
  }>;
};
