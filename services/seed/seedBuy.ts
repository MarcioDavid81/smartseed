import { Buy } from "@/types";
import { apiFetch } from "../api";
import { BuyFormData } from "@/lib/schemas/seedBuyScheema";

export async function getBuyByCycle(
  cycleId: string
): Promise<Buy[]> {
  const data = await apiFetch<Buy[]>(
    `/api/buys?cycleId=${cycleId}`
  );

  return data.filter((buy) => buy.quantityKg > 0);
}


type UpsertBuyParams = {
  data: BuyFormData;
  cycleId: string;
  buyId?: string;
  purchaseOrderItemId?: string;
};

export function upsertBuy({
  data,
  cycleId,
  buyId,
  purchaseOrderItemId,
}: UpsertBuyParams) {
  const url = buyId
    ? `/api/buys/${buyId}`
    : "/api/buys";

  const method = buyId ? "PUT" : "POST";

  return apiFetch<Buy>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
      purchaseOrderItemId,
    }),
  });
}

export function deleteBuy(buyId: string) {
  return apiFetch<Buy>(`/api/buys/${buyId}`, {
    method: "DELETE",
  });
}
