import { AccountStatus, PaymentCondition, ProductType } from "@prisma/client";

export type IndustrySaleDetails = {
  id: string;
  date: string;
  document: string;
  product: ProductType;
  truckPlate: string;
  truckDriver: string;
  weightBt: string;
  weightTr: string;
  weightSubLiq: string;
  weightLiq: string;
  discountsKg: string | null;
  unitPrice: number;
  totalPrice: number;
  paymentCondition: PaymentCondition;
  dueDate: string | null;
  notes: string | null;
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

  industryDeposit: {
    name: string;
  };

  industryTransporter: {
    name: string;
    cpf_cnpj: string;
    city: string;
    state: string;
    phone: string;
  };

  accountReceivable: {
    description: string;
    amount: number;
    dueDate:AccountStatus;
  };
};
