import { Unit } from "@prisma/client";

export type SaleContractItemDelivery = {
  id: string;
  date: string;
  invoice: string;
  quantity: number;
  unit: Unit;
  totalPrice: number;
};