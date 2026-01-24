import { Cultivar } from "@/types";
import { apiFetch } from "../api";

export async function getSeedCultivars(): Promise<Cultivar[]> {
  const data = await apiFetch<Cultivar[]>(
    "/api/cultivars/get"
  );

  return data;
}