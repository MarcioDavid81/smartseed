import { CycleStatus, ProductType } from "@prisma/client";

interface Farm {
  id: string;
  name: string;
}

interface Talhao {
  id: string;
  name: string;
  area: number;
  farm: Farm;
}

interface CycleTalhao {
  id: string;
  talhao: Talhao;
}

export interface CycleDetails {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  isActive: boolean;
  productType: ProductType;
  talhoes: CycleTalhao[];
}