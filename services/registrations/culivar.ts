import { ProductType } from "@prisma/client";

export async function getCultivarsByProductType(productType: ProductType, token: string) {
  const res = await fetch(`/api/cultivars/available-for-harvest?productType=${productType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Erro ao buscar cultivares");

  return res.json();
}

export async function getCultivarsByProductTypeAndStock(productType: ProductType, token: string) {
  const res = await fetch(`/api/cultivars/available-for-planting?productType=${productType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Erro ao buscar cultivares");

  return res.json();
}