import { Purchase } from "@/types";
import { apiFetch } from "../api";
import { InputPurchaseFormData } from "@/lib/schemas/inputSchema";

export async function getInputPurchase(): Promise<Purchase[]> {
  const data = await apiFetch<Purchase[]>(
    "/api/insumos/purchases"
  );

  return data;
}

type UpsertInputPurchaseParams = {
  data: InputPurchaseFormData;
  purchaseId?: string;
};

export function upsertInputPurchase({
  data,
  purchaseId,
}: UpsertInputPurchaseParams) {
  const url = purchaseId
    ? `/api/insumos/purchases/${purchaseId}`
    : "/api/insumos/purchases";

  const method = purchaseId ? "PUT" : "POST";

  return apiFetch<Purchase>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteInputPurchase(purchaseId: string) {
  return apiFetch<Purchase>(`/api/insumos/purchases/${purchaseId}`, {
    method: "DELETE",
  });
}