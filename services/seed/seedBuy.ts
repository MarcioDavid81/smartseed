import { Buy } from "@/types";
import { apiFetch } from "../api";
import { BuyFormData } from "@/lib/schemas/seedBuyScheema";

export async function getBuyByCycle(
  cycleId: string
): Promise<Buy[]> {
  const data = await apiFetch<Buy[]>(
    `/api/buy?cycleId=${cycleId}`
  );

  return data.filter((buy) => buy.quantityKg > 0);
}


type UpsertBuyParams = {
  data: BuyFormData;
  cycleId: string;
  buyId?: string;
};

export function upsertBuy({
  data,
  cycleId,
  buyId,
}: UpsertBuyParams) {
  const url = buyId
    ? `/api/buy/${buyId}`
    : "/api/buy";

  const method = buyId ? "PUT" : "POST";

  return apiFetch<Buy>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteBuy(buyId: string) {
  return apiFetch<Buy>(`/api/buy/${buyId}`, {
    method: "DELETE",
  });
}
