import { Prisma } from "@prisma/client";

export class PurchaseOrderDomainService {
  static async itemHasMovements(
    tx: Prisma.TransactionClient,
    itemId: string,
  ): Promise<boolean> {
    const [purchaseCount, buyCount] = await Promise.all([
      tx.purchase.count({
        where: { purchaseOrderItemId: itemId },
      }),
      tx.buy.count({
        where: { purchaseOrderItemId: itemId },
      }),
    ]);

    return purchaseCount > 0 || buyCount > 0;
  }

  static async getMovedQuantity(
    tx: Prisma.TransactionClient,
    itemId: string,
  ): Promise<number> {
    const [purchases, buys] = await Promise.all([
      tx.purchase.aggregate({
        where: { purchaseOrderItemId: itemId },
        _sum: { quantity: true },
      }),
      tx.buy.aggregate({
        where: { purchaseOrderItemId: itemId },
        _sum: { quantityKg: true },
      }),
    ]);

    return (
      Number(purchases._sum.quantity ?? 0) +
      Number(buys._sum.quantityKg ?? 0)
    );
  }

  // 🔒 DELETE
  static async canDeleteOrder(
    tx: Prisma.TransactionClient,
    purchaseOrderId: string,
  ): Promise<boolean> {
    const items = await tx.purchaseOrderItem.findMany({
      where: { purchaseOrderId },
      select: { id: true },
    });

    for (const item of items) {
      if (await this.itemHasMovements(tx, item.id)) {
        return false;
      }
    }

    return true;
  }

  static async validateItemCrate(
    tx: Prisma.TransactionClient,
    itemId: string,
    newQuantity?: number,
  ): Promise<void> {
    if (newQuantity === undefined) return;

    const movedQuantity = await this.getMovedQuantity(tx, itemId);

    if (newQuantity < movedQuantity) {
      throw new Error(
        `ITEM_QUANTITY_LESS_THAN_MOVED:${movedQuantity}`,
      );
    }
  }
}