import {
  Beneficiation,
  Buy,
  ConsumptionExit,
  Harvest,
  ProductType,
  SaleExit,
} from "@prisma/client";
import { Talhao } from "./plot";

export interface Cycle {
  id: string;
  name: string;
  productType: ProductType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  companyId: string;
  harvests: Harvest[];
  buys: Buy[];
  beneficiations: Beneficiation[];
  consumptionExits: ConsumptionExit[];
  salesExits: SaleExit[];
  talhoes: Talhao[];
  createdAt: Date;
}

export interface CycleTalhao {
  id: string;
  cycleId: string;
  talhaoId: string;
  cycle: Cycle;
  talhao: Talhao;
  createdAt: Date;
}
