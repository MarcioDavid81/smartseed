import { SaleExit } from "@prisma/client";

export interface Customer {
    id: string;
    name: string;
    email?: string;
    adress?: string;
    city?: string;
    state?: string;
    phone?: string;
    cpf_cnpj?: string;
    companyId: string;
    sales: SaleExit[];
    createdAt: Date;
}