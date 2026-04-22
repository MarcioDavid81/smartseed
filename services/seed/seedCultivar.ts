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

export async function getCultivarStock(): Promise<Cultivar[]> {
  const data = await apiFetch<Cultivar[]>(
    "/api/cultivars/get"
  );
  const stock = data.filter((item) => item.stock > 0);
  return stock;
}