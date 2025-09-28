import { AccountStatus, SaleExit } from "@prisma/client";

export interface AccountPayable {
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
  createdAt: Date;
  updatedAt: Date;
}
