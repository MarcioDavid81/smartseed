import { AccountPayable, PaymentCondition } from "@prisma/client";

export interface FuelPurchase {
  id: string;
  date: Date;
  invoiceNumber: string;
  fileUrl?: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  customerId: string;
  customer: {
    id: string;
    name: string;
  };
  tankId: string;
  tank: {
    id: string;
    name: string;
  };
  paymentCondition?: PaymentCondition;
  dueDate?: Date;
  accountPayable?: AccountPayable | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}