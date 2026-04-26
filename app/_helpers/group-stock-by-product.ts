import { ProductStock } from "@/types";

export type GroupedByProduct = {
  product: {
    id: string;
    name: string;
    class: string;
    unit: string;
  };
  total: number;
  farms: {
    id: string;
    farmId: string;
    farmName: string;
    stock: number;
  }[];
};

export function groupStockByProduct(data: ProductStock[]): GroupedByProduct[] {
  const map = new Map<string, GroupedByProduct>();

  for (const item of data) {
    const productId = item.product.id;

    if (!map.has(productId)) {
      map.set(productId, {
        product: {
          id: item.product.id,
          name: item.product.name,
          class: item.product.class,
          unit: item.product.unit,
        },
        total: 0,
        farms: [],
      });
    }

    const group = map.get(productId)!;

    group.farms.push({
      id: item.id,
      farmId: item.farm.id,
      farmName: item.farm.name,
      stock: item.stock,
    });

    group.total += item.stock;
  }

  const groups = Array.from(map.values());

  // ordenar fazendas
  for (const group of groups) {
    group.farms.sort((a, b) =>
      a.farmName.localeCompare(b.farmName, "pt-BR")
    );
  }

  // ordenar produtos
  return groups.sort((a, b) =>
    a.product.name.localeCompare(b.product.name, "pt-BR")
  );
}