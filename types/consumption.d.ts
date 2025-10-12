export interface Consumption {
  id: string;
  cultivarId: string;
  cultivar: {
    id: string;
    name: string;
  };
  date: string;
  quantityKg: number;
  farmId: string;
  farm: {
    id: string;
    name: string;
  };
  talhaoId?: string;
  talhao?: {
    id: string;
    name: string;
    area: number;
  };
  notes?: string;
  companyId: string;
  cycleId: string;
  createdAt: Date;
}
