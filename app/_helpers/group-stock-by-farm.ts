import { ProductStock } from "@/types";

export type GroupedStock = {
  farm: {
    id: string;
    name: string;
  };
  total: number;
  products: {
    id: string;
    productId: string;
    name: string;
    class: string;
    unit: string;
    stock: number;
  }[];
};

export function groupStockByFarm(data: ProductStock[]): GroupedStock[] {
  const map = new Map<string, GroupedStock>();

  for (const item of data) {
    const farmId = item.farm.id;

    if (!map.has(farmId)) {
      map.set(farmId, {
        farm: item.farm,
        total: 0,
        products: [],
      });
    }

    const group = map.get(farmId)!;

    group.products.push({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      class: item.product.class,
      unit: item.product.unit,
      stock: item.stock,
    });

    group.total += item.stock;
  }

  return Array.from(map.values());
}