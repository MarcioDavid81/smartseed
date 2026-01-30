import { Prisma } from "@prisma/client";

export class SaleContractDomainService {
  static async itemHasMovements(
    tx: Prisma.TransactionClient,
    itemId: string,
  ): Promise<boolean> {
    const [saleExitCount, industrySaleCount] = await Promise.all([
      tx.saleExit.count({
        where: { saleContractItemId: itemId },
      }),
      tx.industrySale.count({
        where: { saleContractItemId: itemId },
      }),
    ]);

    return saleExitCount > 0 || industrySaleCount > 0;
  }

  static async getMovedQuantity(
    tx: Prisma.TransactionClient,
    itemId: string,
  ): Promise<number> {
    const [saleExits, industrySales] = await Promise.all([
      tx.saleExit.aggregate({
        where: { saleContractItemId: itemId },
        _sum: { quantityKg: true },
      }),
      tx.industrySale.aggregate({
        where: { saleContractItemId: itemId },
        _sum: { weightLiq: true },
      }),
    ]);

    return (
      Number(saleExits._sum.quantityKg ?? 0) +
      Number(industrySales._sum.weightLiq ?? 0)
    );
  }

  // 🔒 DELETE
  static async canDeleteContract(
    tx: Prisma.TransactionClient,
    saleContractId: string,
  ): Promise<boolean> {
    const items = await tx.saleContractItem.findMany({
      where: { saleContractId },
      select: { id: true },
    });

    for (const item of items) {
      if (await this.itemHasMovements(tx, item.id)) {
        return false;
      }
    }

    return true;
  }

  static async validateItemCreate(
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