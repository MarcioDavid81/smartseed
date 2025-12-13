import { IndustryHarvest } from "@/types";
import { apiFetch } from "../api";

export async function getHarvestsByCycle(
  cycleId: string
): Promise<IndustryHarvest[]> {
  const data = await apiFetch<IndustryHarvest[]>(
    `/api/industry/harvest?cycleId=${cycleId}`
  );

  return data.filter((industryHarvest) => industryHarvest.weightLiq > 0);
}
