import { Insumo } from "@/types";
import { apiFetch } from "../api";
import { InputProductFormData } from "@/lib/schemas/inputSchema";

export async function getInputProducts(): Promise<Insumo[]> {
  const data = await apiFetch<Insumo[]>(
    "/api/insumos/products"
  );

  return data;
}

type UpsertInputProductParams = {
  data: InputProductFormData;
  productId?: string;
};

export function upsertInputProduct({
  data,
  productId,
}: UpsertInputProductParams) {
  const url = productId
    ? `/api/insumos/products/${productId}`
    : "/api/insumos/products";

  const method = productId ? "PUT" : "POST";

  return apiFetch<Insumo>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteInputProduct(productId: string) {
  return apiFetch<Insumo>(`/api/insumos/products/${productId}`, {
    method: "DELETE",
  });
}