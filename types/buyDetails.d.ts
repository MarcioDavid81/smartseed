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