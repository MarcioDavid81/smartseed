import { PurchaseOrder } from "@/types";
import { apiFetch } from "../api";
import { PurchaseOrderFormData } from "@/lib/schemas/purchaseOrderSchema";

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const data = await apiFetch<PurchaseOrder[]>(
    `/api/commercial/purchase-orders`
  );

  return data;
}

export async function getPurchaseOrderById(
  purchaseOrderId: string,
): Promise<PurchaseOrder> {
  const data = await apiFetch<PurchaseOrder>(
    `/api/commercial/purchase-orders/${purchaseOrderId}`,
  );
  return data;
}

type UpsertPurchaseOrderParams = {
  data: PurchaseOrderFormData;
  purchaseOrderId?: string;
};

export function upsertPurchaseOrder({
  data,
  purchaseOrderId,
}: UpsertPurchaseOrderParams) {
  const url = purchaseOrderId
    ? `/api/commercial/purchase-orders/${purchaseOrderId}`
    : "/api/commercial/purchase-orders";  

  const method = purchaseOrderId ? "PUT" : "POST";

  return apiFetch<PurchaseOrder>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deletePurchaseOrder(purchaseOrderId: string) {  
  return apiFetch<PurchaseOrder>(`/api/commercial/purchase-orders/${purchaseOrderId}`, {
    method: "DELETE",
  });
}
