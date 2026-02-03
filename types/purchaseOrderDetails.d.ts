import {
  ComercialStatus,
  PurchaseOrderType,
  Unit,
} from "@prisma/client";

export type PurchaseOrderDetails = {
  id: string;
  type: PurchaseOrderType;
  date: Date;
  document: string | null;
  status: ComercialStatus;
  notes: string | null;

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

    product?: {
      id: string;
      name: string;
    } | null;

    cultivar?: {
      id: string;
      name: string;
    } | null;
  }>;

  deliveries: Array<{
    id: string;
    date: string;
    quantity: number;
    unit: Unit;
  }>;
};
