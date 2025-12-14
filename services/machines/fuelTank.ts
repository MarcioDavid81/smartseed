import { FuelTank } from "@/types";
import { apiFetch } from "../api";
import { FuelTankFormData } from "@/lib/schemas/fuelTankSchema";

export async function getFuelTank(): Promise<FuelTank[]> {
  const data = await apiFetch<FuelTank[]>(
    "/api/machines/fuel-tank"
  );

  return data;
}

type UpsertFuelTankParams = {
  data: FuelTankFormData;
  fuelTankId?: string;
};

export function upsertFuelTank({
  data,
  fuelTankId,
}: UpsertFuelTankParams) {
  const url = fuelTankId
    ? `/api/machines/fuel-tank/${fuelTankId}`
    : "/api/machines/fuel-tank";

  const method = fuelTankId ? "PUT" : "POST";

  return apiFetch<void>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteFuelTank(fuelTankId: string) {
  return apiFetch<void>(`/api/machines/fuel-tank/${fuelTankId}`, {
    method: "DELETE",
  });
}