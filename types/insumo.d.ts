import { ProductClass, Unit, Purchase, TransferExit, Application, ProductStock } from "@prisma/client";

export interface Insumo {
  id: string;
  name: string;
  description: string;
  class: ProductClass;
  unit: Unit;
  companyId: string;
  purchases: Purchase[];
  transfers: TransferExit[];
  applications: Application[];
  stocks: ProductStock[];
}
