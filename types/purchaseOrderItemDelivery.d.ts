import { Unit } from "@prisma/client";

export type PurchaseOrderItemDelivery = {
  id: string;
  date: string;
  quantity: number;
  unit: Unit;
};
