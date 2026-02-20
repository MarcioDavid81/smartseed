import { Purchase, PurchaseDetails } from "@/types";
import { apiFetch } from "../api";
import { InputPurchaseFormData } from "@/lib/schemas/inputSchema";

export async function getInputPurchases(): Promise<Purchase[]> {
  const data = await apiFetch<Purchase[]>(
    "/api/insumos/purchases"
  );

  return data;
}

export async function getInputPurchaseById(purchaseId: string): Promise<PurchaseDetails> {
  const data = await apiFetch<PurchaseDetails>(
    `/api/insumos/purchases/${purchaseId}`
  );

  return data;
}

type UpsertInputPurchaseParams = {
  data: InputPurchaseFormData;
  purchaseId?: string;
  purchaseOrderItemId?: string;
};

export function upsertInputPurchase({
  data,
  purchaseId,
  purchaseOrderItemId,
}: UpsertInputPurchaseParams) {
  const url = purchaseId
    ? `/api/insumos/purchases/${purchaseId}`
    : "/api/insumos/purchases";

  const method = purchaseId ? "PUT" : "POST";

  return apiFetch<Purchase>(url, {
    method,
    body: JSON.stringify({
      ...data,
      purchaseOrderItemId,
    }),
  });
}

export function deleteInputPurchase(purchaseId: string) {
  return apiFetch<Purchase>(`/api/insumos/purchases/${purchaseId}`, {
    method: "DELETE",
  });
}