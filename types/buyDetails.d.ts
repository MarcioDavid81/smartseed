import { AccountStatus, PaymentCondition, ProductType } from "@prisma/client";

export interface BuyDetails {
  id: string;
  date: string;
  invoice: string;
  quantityKg: number;
  unityPrice: number;
  totalPrice: number;
  notes: string;
  paymentCondition: PaymentCondition;
  dueDate: string | null;
  fileUrl: string | null;

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

  cultivar: {
    name: string;
    product: ProductType;
  };

  accountPayable: {
    description: string;
    amount: number;
    status: AccountStatus;
  };
}