export interface RawEntry {
    id: string;
    cultivarId: string;
    date: Date;
    quantityKg: number;
    origin?: string;
    userId: string;
    notes?: string;
    createdAt: Date;
  }