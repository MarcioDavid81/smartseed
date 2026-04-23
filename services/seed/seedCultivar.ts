import { Cultivar } from "@/types";
import { apiFetch } from "../api";

export async function getSeedCultivars(): Promise<Cultivar[]> {
  const data = await apiFetch<Cultivar[]>(
    "/api/cultivars/get"
  );

  return data;
}

export async function getSeedCultivarAvailableForSale(): Promise<Cultivar[]> {
  const data = await apiFetch<Cultivar[]>(
    "/api/cultivars/available-for-sale"
  );

  return data;
}

export async function getSeedCultivarById(
  cultivarId: string,
): Promise<Cultivar> {
  return apiFetch<Cultivar>(`/api/cultivars/${cultivarId}`);
}

export interface SeedStockFilters {
  showZero?: boolean;
}

export async function getCultivarStock(
  filters: SeedStockFilters,
): Promise<Cultivar[]> {
  const params = new URLSearchParams();

  if (filters?.showZero) {
    params.set("showZero", "true");
  }

  const query = params.toString();
  const data = await apiFetch<Cultivar[]>(
    `/api/cultivars/stock?${query}`
  );
  return data;
}