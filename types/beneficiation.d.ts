export interface Beneficiation {
  id: string;
  cultivarId: string;
  date: Date;
  quantityKg: number;
  notes?: string;
  companyId: string;
  createdAt: Date;
}