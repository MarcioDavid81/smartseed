import { ProductType } from "@prisma/client";
import { SaleContractItemDelivery } from "./saleContractItemDelivery";


export type SaleContractItemDetail = {
  id: string;
  description: string | null;

  quantity: number;
  fulfilledQuantity: number;
  remainingQuantity: number;
  unit: Unit;

  product: ProductType | null;

  cultivar: {
    id: string;
    name: string;
  } | null;

  deliveries: SaleContractItemDelivery[];
};
