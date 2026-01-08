import { Harvest } from "@/types";
import { apiFetch } from "../api";
import { SeedHarvestFormData } from "@/lib/schemas/seedHarvestSchema";

export async function getSeedHarvestByCycle(
  cycleId: string
): Promise<Harvest[]> {
  const data = await apiFetch<Harvest[]>(
    `/api/harvest?cycleId=${cycleId}`
  );

  return data.filter((harvest) => harvest.quantityKg > 0);
}


type UpsertHarvestParams = {
  data: SeedHarvestFormData;
  cycleId: string;
  harvestId?: string;
};

export function upsertSeedHarvest({
  data,
  cycleId,
  harvestId,
}: UpsertHarvestParams) {
  const url = harvestId
    ? `/api/harvest/${harvestId}`
    : "/api/harvest";

  const method = harvestId ? "PUT" : "POST";

  return apiFetch<Harvest>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteSeedHarvest(harvestId: string) {
  return apiFetch<Harvest>(`/api/harvest/${harvestId}`, {
    method: "DELETE",
  });
}
