import { IndustryStock } from "@/types";
import { ProductType } from "@prisma/client";

export type IndustryGroupedByProduct = {
  product: ProductType;
  total: number;
  deposits: {
    depositId: string;
    depositName: string;
    quantity: number;
  }[];
};

export function groupIndustryStockByProduct(
  data: IndustryStock[],
): IndustryGroupedByProduct[] {
  const map = new Map<ProductType, { total: number; deposits: Map<string, { depositId: string; depositName: string; quantity: number }> }>();

  for (const item of data) {
    const product = item.product;
    const depositId = item.industryDeposit.id;

    if (!map.has(product)) {
      map.set(product, {
        total: 0,
        deposits: new Map(),
      });
    }

    const group = map.get(product)!;

    const quantity = Number(item.quantity);

    group.total += quantity;

    const existing = group.deposits.get(depositId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      group.deposits.set(depositId, {
        depositId,
        depositName: item.industryDeposit.name,
        quantity,
      });
    }
  }

  const groups: IndustryGroupedByProduct[] = Array.from(map.entries()).map(
    ([product, value]) => ({
      product,
      total: value.total,
      deposits: Array.from(value.deposits.values()).sort((a, b) =>
        a.depositName.localeCompare(b.depositName, "pt-BR"),
      ),
    }),
  );

  return groups.sort((a, b) => a.product.localeCompare(b.product, "pt-BR"));
}