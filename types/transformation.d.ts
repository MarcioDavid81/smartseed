export interface Transformation {
  id: string;
  date: Date;
  cultivarId: string;
  cultivar: {
    id: string;
    name: string;
  }
  destinationId: string;
  destination: {
    id: string;
    name: string;
  };
  quantityKg: number;
  notes?: string;
  companyId: string;
  createdAt: Date;
}