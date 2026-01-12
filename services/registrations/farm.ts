import { Farm } from "@/types";
import { apiFetch } from "../api";
import { FarmFormData } from "@/lib/schemas/farmSchema";

export async function getFarms(): Promise<Farm[]> {
  const data = await apiFetch<Farm[]>(
    `/api/farms`
  );

  return data;
}

type UpsertFarmParams = {
  data: FarmFormData;
  farmId?: string;
};

export function upsertFarm({
  data,
  farmId,
}: UpsertFarmParams) {
  const url = farmId
    ? `/api/farms/${farmId}`
    : "/api/farms";

  const method = farmId ? "PUT" : "POST";

  return apiFetch<Farm>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteFarm(farmId: string) {
  return apiFetch<Farm>(`/api/farms/${farmId}`, {
    method: "DELETE",
  });
}