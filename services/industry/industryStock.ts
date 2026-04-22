import { IndustryStock } from "@/types";
import { apiFetch } from "../api";

export interface IndustryStockFilters {
  showZero?: boolean;
  depositId?: string;
  product?: string;
}

export async function getIndustryStock(
  filters?: IndustryStockFilters
): Promise<IndustryStock[]> {
  const params = new URLSearchParams();

  if (filters?.showZero) {
    params.set("showZero", "true");
  }

  if (filters?.depositId) {
    params.set("depositId", filters.depositId);
  }

  if (filters?.product) {
    params.set("product", filters.product);
  }

  const query = params.toString();

  const data = await apiFetch<IndustryStock[]>(
    `/api/industry/stock${query ? `?${query}` : ""}`
  );

  return data;
}