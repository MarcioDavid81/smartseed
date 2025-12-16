import { FuelPurchase, FuelTank } from "@/types";
import { apiFetch } from "../api";
import { FuelPurchaseFormData } from "@/lib/schemas/fuelPurchaseSchema";

export async function getFuelPurchase(): Promise<FuelPurchase[]> {
  const data = await apiFetch<FuelPurchase[]>(
    "/api/machines/fuel-purchase"
  );

  return data;
}

type UpsertFuelPurchaseParams = {
  data: FuelPurchaseFormData;
  fuelPurchaseId?: string;
};

export function upsertFuelPurchase({
  data,
  fuelPurchaseId,
}: UpsertFuelPurchaseParams) {
  const url = fuelPurchaseId
    ? `/api/machines/fuel-purchase/${fuelPurchaseId}`
    : "/api/machines/fuel-purchase";

  const method = fuelPurchaseId ? "PUT" : "POST";

  return apiFetch<FuelPurchase>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteFuelPurchase(fuelPurchaseId: string) {
  return apiFetch<FuelPurchase>(
    `/api/machines/fuel-purchase/${fuelPurchaseId}`, {
      method: "DELETE",
    });
}
