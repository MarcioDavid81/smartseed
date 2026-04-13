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
  memberId?: string | null
  member?: {
    id: string
    name: string
    email: string
    phone: string
    cpf: string
  }
  memberAdressId?: string | null
  memberAdress?: {
    id: string
    stateRegistration: string
    zip: string
    adress: string
    number: string
    complement: string
    district: string
    state: string
    city: string
  }
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