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
  description: string;
  totalValue: number;
  paymentCondition?: PaymentCondition;
  dueDate?: Date;
  accountPayable?: AccountPayable | null;
  companyId: string;
  createdAt: Date;
}