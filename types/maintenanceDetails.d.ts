import { AccountStatus, PaymentCondition } from "@prisma/client";

export interface MaintenanceDetails {
  id: string;
  date: string;
  description: string;
  totalValue: number;
  paymentCondition?: PaymentCondition;
  dueDate: string | null;

  customer: {
    name: string;
    cpf_cnpj: string;
    adress: string;
    city: string;
    state: string;
    phone: string;
    email: string;
  };

  member: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  memberAdress: {
    stateRegistration: string;
    zip: string;
    adress: string;
    number: string;
    complement: string;
    district: string;
    state: string;
    city: string;
  };

  accountPayable: {
    description: string;
    amount: number;
    status: AccountStatus;
  };

}