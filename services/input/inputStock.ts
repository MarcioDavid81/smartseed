import { ProductStock } from "@/types";
import { apiFetch } from "../api";

export interface InputStockFilters {
  farmId?: string;
  product?: string;
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

  if (filters?.product) {
    params.set("product", filters.product);
  }

  const query = params.toString();
  
  const data = await apiFetch<ProductStock[]>(
    `/api/insumos/stock${query ? `?${query}` : ""}`
  );

  return data;
}