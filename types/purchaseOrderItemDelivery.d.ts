import { Unit } from "@prisma/client";

export type PurchaseOrderItemDelivery = {
  id: string;
  date: string;
  invoice: string;
  quantity: number;
  unit: Unit;
  totalPrice: number;
};
