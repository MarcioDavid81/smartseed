import { SaleExit } from "@prisma/client";

export interface Customer {
    id: string;
    name: string;
    fantasyName?: string;
    cpf_cnpj?: string;
    adress?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    companyId: string;
    sales: SaleExit[];
    createdAt: Date;
}