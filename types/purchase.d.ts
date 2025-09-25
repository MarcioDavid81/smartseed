import { AccountPayable, PaymentCondition, Unit } from "@prisma/client";

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
  cycleId?: string | null;
  paymentCondition?: PaymentCondition;
  dueDate?: Date;
  accountPayable?: AccountPayable | null;
  createdAt: Date;
  updatedAt: Date;
}
