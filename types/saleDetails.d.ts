import { AccountStatus, PaymentCondition, ProductType } from "@prisma/client";

export interface SaleDetails {
  id: string;
  date: string;
  quantityKg: number;
  invoiceNumber: string;
  saleValue: number;
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

  accountReceivable: {
    description: string;
    amount: number;
    dueDate:AccountStatus;
  };
}