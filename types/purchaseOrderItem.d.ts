import { PurchaseOrderType } from "@prisma/client";

export interface PurchaseOrderItem {
  id: string,
  purchaseOrderId:  string,
  purchaseOrder: {
    id: string,
    type: PurchaseOrderType,
    date: Date,
    document: string,
    customerId: string,
    customer: {
      id: string,
      name: string,
    },
  },
  productId?: string,
  product?: {
    id: string,
    name: string,
  }
  cultivarId?: string,
  cultivar?: {
    id: string,
    name: string
  },
  description?: string,
  quantity: number,
  unit: Unit,
  unityPrice: number,
  totalPrice: number,
  fulfilledQuantity: number,
}