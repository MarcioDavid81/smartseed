import { AdjustmentType } from "@prisma/client";

export interface SeedAdjustStock {
  id: string;
  date: Date;
  quantityKg: number;
  cultivarId: string;
  cultivar: {
    id: string;
    name: string;
  };
  companyId: string;
  notes?: string;
}