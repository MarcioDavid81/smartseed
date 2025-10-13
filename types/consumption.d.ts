export interface Consumption {
  id: string;
  cultivarId: string;
  cultivar: {
    id: string;
    name: string;
  };
  date: string;
  quantityKg: number;
  talhaoId: string;
  talhao: {
    id: string;
    name: string;
    area: number;
    farm: {
      id: string;
      name: string;
    }
  };
  notes?: string;
  companyId: string;
  cycleId: string;
  createdAt: Date;
}
