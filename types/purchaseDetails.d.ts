import { AccountStatus, PaymentCondition, ProductClass, Unit } from "@prisma/client";

export interface PurchaseDetails {
  id: string;
  date: string;
  invoiceNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
  paymentCondition: PaymentCondition;
  dueDate: string | null;
  fileUrl: string | null;

  product: {
    name: string;
    class: ProductClass;
    unit: Unit;
  }

  farm: {
    name: string;
  }

  customer: {
    name: string;
    cpf_cnpj: string;
    adress: string;
    city: string;
    state: string;
    phone: string;
    email: string;
  };

  accountPayable: {
    description: string;
    amount: number;
    status: AccountStatus;
  };

}