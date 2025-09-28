import { AccountStatus, Buy, PaymentCondition, Purchase, Unit } from "@prisma/client";

export interface AccountPayable {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: AccountStatus;
  companyId: string;
  buyId: string;
  buy: Buy;
  purchseId: string;
  purchase: Purchase;
  customerId: string;
  customer: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}