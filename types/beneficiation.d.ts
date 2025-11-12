export interface Beneficiation {
  id: string;
  cultivarId: string;
  cultivar: {
    id: string;
    name: string;
  }
  destinationId?: string;
  destination?: {
    id: string;
    name: string;
  };
  date: Date;
  quantityKg: number;
  notes?: string;
  companyId: string;
  cycleId: string;
  createdAt: Date;
}