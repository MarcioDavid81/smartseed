import { Sale } from "@/types";
import { apiFetch } from "../api";
import { SeedSaleFormData } from "@/lib/schemas/seedSaleSchema";

export async function getSeedSalesByCycle(
  cycleId: string
): Promise<Sale[]> {
  const data = await apiFetch<Sale[]>(
    `/api/sales?cycleId=${cycleId}`
  );

  return data.filter((sale) => sale.quantityKg > 0);
}


type UpsertSaleParams = {
  data: SeedSaleFormData;
  cycleId: string;
  saleId?: string;
};

export function upsertSeedSale({
  data,
  cycleId,
  saleId,
}: UpsertSaleParams) {
  const url = saleId
    ? `/api/sales/${saleId}`
    : "/api/sales";

  const method = saleId ? "PUT" : "POST";

  return apiFetch<Sale>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteSeedSale(saleId: string) {
  return apiFetch<Sale>(`/api/sales/${saleId}`, {
    method: "DELETE",
  });
}
