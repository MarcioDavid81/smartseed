import { Refuel } from "@/types";
import { apiFetch } from "../api";
import { RefuelFormData } from "@/lib/schemas/refuelSchema";

export async function getRefuel(): Promise<Refuel[]> {
  const data = await apiFetch<Refuel[]>(
    "/api/machines/refuel"
  );

  return data;
}

type UpsertRefuelParams = {
  data: RefuelFormData;
  refuelId?: string;
};

export function upsertRefuel({
  data,
  refuelId,
}: UpsertRefuelParams) {
  const url = refuelId
    ? `/api/machines/refuel/${refuelId}`
    : "/api/machines/refuel";

  const method = refuelId ? "PUT" : "POST";

  return apiFetch<Refuel>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteRefuel(refuelId: string) {
  return apiFetch<Refuel>(
    `/api/machines/refuel/${refuelId}`, {
      method: "DELETE",
    });
}
