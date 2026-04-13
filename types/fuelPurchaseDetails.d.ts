export interface FuelPurchaseDetails {
  id: string;
  date: string;
  invoiceNumber: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  paymentCondition?: PaymentCondition;
  dueDate: string | null;

  tank: {
    name: string;
  };

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