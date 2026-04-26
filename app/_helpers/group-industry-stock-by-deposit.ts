import { IndustryStock } from "@/types";
import { ProductType } from "@prisma/client";

export type IndustryGroupedStock = {
  deposit: {
    id: string;
    name: string;
  };
  total: number;
  products: {
    product: ProductType;
    quantity: number;
  }[];
};

export function groupIndustryStockByDeposit(
  data: IndustryStock[],
): IndustryGroupedStock[] {
  const map = new Map<string, IndustryGroupedStock>();

  for (const item of data) {
    const depositId = item.industryDeposit.id;

    if (!map.has(depositId)) {
      map.set(depositId, {
        deposit: item.industryDeposit,
        total: 0,
        products: [],
      });
    }

    const group = map.get(depositId)!;

    const quantity = Number(item.quantity);

    group.total += quantity;

    const existing = group.products.find((p) => p.product === item.product);
    if (existing) {
      existing.quantity += quantity;
    } else {
      group.products.push({
        product: item.product,
        quantity,
      });
    }
  }

  const groups = Array.from(map.values());

  for (const group of groups) {
    group.products.sort((a, b) => a.product.localeCompare(b.product, "pt-BR"));
  }

  return groups.sort((a, b) => a.deposit.name.localeCompare(b.deposit.name, "pt-BR"));
}