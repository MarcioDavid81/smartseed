import { PurchaseOrderItemDelivery } from "./purchaseOrderItemDelivery";

export type PurchaseOrderItemDetail = {
  id: string;
  description: string | null;

  unityPrice: number;
  totalPrice: number;

  quantity: number;
  fulfilledQuantity: number;
  remainingQuantity: number;
  unit: Unit;

  product: {
    id: string;
    name: string;
  } | null;

  cultivar: {
    id: string;
    name: string;
  } | null;

  deliveries: PurchaseOrderItemDelivery[];
};
