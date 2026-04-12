import { AccountStatus, SaleExit } from "@prisma/client";

export interface AccountReceivable {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  receivedDate?: Date;
  status: AccountStatus;
  companyId: string;
  saleExitId: string;
  saleExit: SaleExit;
  customerId?: string;
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
