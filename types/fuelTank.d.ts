import { FuelPurchase, Refuel } from "@prisma/client";

export interface FuelTank {
  id: string;
  name: string;
  capacity: number;
  stock: number;
  purchases: FuelPurchase[];
  refuels: Refuel[];
  companyId: string;
  createdAt: Date;
}