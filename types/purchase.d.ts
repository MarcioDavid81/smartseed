import { Unit, InsumoOperationType } from "@prisma/client";

export interface Purchase {
  id: string;
  date: Date;
  customerId: string;
  customer: {
    id: string;
    name: string;
  };
  productId: string;
  product: {
    id: string;
    name: string;
    unit: Unit;
  };
  invoiceNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  farmId: string;
  farm: {
    id: string;
    name: string;
  };
  notes: string;
  companyId: string;
  cycleId: string;
  createdAt: Date;
  updatedAt: Date;
}
