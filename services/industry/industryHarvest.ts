import { IndustryHarvest } from "@/types";
import { apiFetch } from "../api";
import { IndustryHarvestFormData } from "@/lib/schemas/industryHarvest";

export async function getHarvestsByCycle(
  cycleId: string
): Promise<IndustryHarvest[]> {
  const data = await apiFetch<IndustryHarvest[]>(
    `/api/industry/harvest?cycleId=${cycleId}`
  );

  return data.filter((industryHarvest) => industryHarvest.weightLiq > 0);
}


type UpsertHarvestParams = {
  data: IndustryHarvestFormData;
  cycleId: string;
  harvestId?: string;
};

export function upsertIndustryHarvest({
  data,
  cycleId,
  harvestId,
}: UpsertHarvestParams) {
  const url = harvestId
    ? `/api/industry/harvest/${harvestId}`
    : "/api/industry/harvest";

  const method = harvestId ? "PUT" : "POST";

  return apiFetch<IndustryHarvest>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteIndustryHarvest(harvestId: string) {
  return apiFetch<IndustryHarvest>(`/api/industry/harvest/${harvestId}`, {
    method: "DELETE",
  });
}
