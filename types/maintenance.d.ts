import { AccountPayable, PaymentCondition } from "@prisma/client";

export interface Maintenance {
  id: string;
  date: Date;
  machineId: string;
  machine: {
    id: string;
    name: string;
  };
  customerId: string;
  customer: {
    id: string;
    name: string;
  };
  description: string;
  totalValue: number;
  paymentCondition?: PaymentCondition;
  dueDate?: Date;
  accountPayable?: AccountPayable | null;
  createdAt: Date;
}