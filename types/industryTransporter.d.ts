import { IndustryHarvest } from "@prisma/client";

export interface IndustryTransporter {
  id: string;
  name: string;
  fantasyName?: string;
  cpf_cnpj?: string;
  adress?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  industryHarvests: IndustryHarvest[];
  companyId: string;
}