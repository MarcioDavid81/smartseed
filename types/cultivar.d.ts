import {
  Beneficiation,
  Buy,
  ConsumptionExit,
  Harvest,
  ProductType,
  SaleExit,
} from "@prisma/client";

export interface Cultivar {
  id: string;
  name: string;
  product: ProductType;
  companyId: string;
  harvests: Harvest[];
  buys: Buy[];
  beneficiations: Beneficiation[];
  consumptionsExit: ConsumptionExit[];
  saleExit: SaleExit[];
  stock: number;
  createdAt: Date;
}

export interface CultivarFormData {
  name: string;
  product: ProductType;
}
