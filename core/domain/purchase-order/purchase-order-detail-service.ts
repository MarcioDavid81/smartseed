import { PurchaseOrder, PurchaseOrderItem } from "@prisma/client";

type PurchaseOrderWithRelations = PurchaseOrder & {
  items: (PurchaseOrderItem & {
    seedPurchases: any[];
    inputsPurchases: any[];
    product?: any;
    cultivar?: any;
  })[];
};

export class PurchaseOrderDetailsService {
  static build(order: PurchaseOrderWithRelations) {
    const deliveries = order.items.flatMap((item) => [
      ...item.seedPurchases.map((buy) => ({
        id: buy.id,
        origin: "BUY",
        itemId: item.id,
        date: buy.date,
        quantity: Number(buy.quantityKg),
        unit: item.unit,
        totalPrice: Number(buy.totalPrice),
      })),
      ...item.inputsPurchases.map((purchase) => ({
        id: purchase.id,
        origin: "PURCHASE",
        itemId: item.id,
        date: purchase.date,
        quantity: Number(purchase.quantity),
        unit: item.unit,
        totalPrice: Number(purchase.totalPrice),
      })),
    ]);

    const items = order.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      fulfilledQuantity: Number(item.fulfilledQuantity),
      remainingQuantity:
        Number(item.quantity) - Number(item.fulfilledQuantity),
      unit: item.unit,
      product: item.product,
      cultivar: item.cultivar,
    }));

    return {
      id: order.id,
      type: order.type,
      date: order.date,
      customer: order.customerId,
      status: order.status,
      notes: order.notes,
      items,
      deliveries,
    };
  }
}
