import { Consumption } from "@/types";
import { apiFetch } from "../api";
import { ConsumptionFormData } from "@/lib/schemas/seedConsumption";

export async function getConsumptionsByCycle(
  cycleId: string
): Promise<Consumption[]> {
  const data = await apiFetch<Consumption[]>(
    `/api/consumption?cycleId=${cycleId}`
  );

  return data.filter((consumption) => consumption.quantityKg > 0);
}


type UpsertConsumptionParams = {
  data: ConsumptionFormData;
  cycleId: string;
  consumptionId?: string;
};

export function upsertConsumption({
  data,
  cycleId,
  consumptionId,
}: UpsertConsumptionParams) {
  const url = consumptionId
    ? `/api/consumption/${consumptionId}`
    : "/api/consumption";

  const method = consumptionId ? "PUT" : "POST";

  return apiFetch<Consumption>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteConsumption(consumptionId: string) {  
  return apiFetch<Consumption>(`/api/consumption/${consumptionId}`, {
    method: "DELETE",
  });
}
