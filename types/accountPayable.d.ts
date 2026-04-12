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
  memberId?: string | null;
  member?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  memberAdressId?: string | null;
  memberAdress?: {
    id: string;
    stateRegistration: string;
    zip: string;
    adress: string;
    number: string;
    complement: string;
    district: string;
    state: string;
    city: string;
  };
  createdAt: Date;
  updatedAt: Date;
}