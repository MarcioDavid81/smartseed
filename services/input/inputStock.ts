import { ProductStock } from "@/types";
import { apiFetch } from "../api";

export interface InputStockFilters {
  farmId?: string;
  productId?: string;
  showZero?: boolean;
}

export async function getInputStock(
  filters: InputStockFilters
): Promise<ProductStock[]> {
    const params = new URLSearchParams();

  if (filters?.showZero) {
    params.set("showZero", "true");
  }

  if (filters?.farmId) {
    params.set("farmId", filters.farmId);
  }

  if (filters?.productId) {
    params.set("productId", filters.productId);
  }

  const query = params.toString();
  
  const data = await apiFetch<ProductStock[]>(
    `/api/insumos/stock${query ? `?${query}` : ""}`
  );

  return data;
}