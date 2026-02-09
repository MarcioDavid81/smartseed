import {
  ComercialStatus,
  ProductType,
  SaleContractType,
  Unit,
} from "@prisma/client";
import { SaleContractItemDelivery } from "./saleContractItemDelivery";

export type SaleContractDetails = {
  id: string;
  type: SaleContractType;
  date: Date;
  document: string | null;
  status: ComercialStatus;
  notes: string | null;
  customerId: string;
  customer: {
    id: string;
    name: string;
  };

  items: Array<{
    id: string;
    description: string | null;
    quantity: number;
    fulfilledQuantity: number;
    remainingQuantity: number;
    unit: Unit;
    unityPrice: number;
    totalPrice: number;
    product: ProductType | null;   
    cultivarId: string | null;
    cultivar: {
      id: string;
      name: string;
    } | null;

    deliveries: SaleContractItemDelivery[];
  }>;

  deliveries: Array<{
    id: string;
    date: string;
    invoice: string;
    quantity: number;
    unit: Unit;
    totalPrice: number;
  }>;
};
