import { Sale } from "@/types";
import { apiFetch } from "../api";
import { SeedSaleFormData } from "@/lib/schemas/seedSaleSchema";

export async function getSeedSalesByCycle(
): Promise<Sale[]> {
  const data = await apiFetch<Sale[]>(
    `/api/sales`
  );

  return data.filter((sale) => sale.quantityKg > 0);
}


type UpsertSaleParams = {
  data: SeedSaleFormData;
  cycleId: string;
  saleId?: string;
  saleContractItemId?: string;
};

export function upsertSeedSale({
  data,
  cycleId,
  saleId,
  saleContractItemId,
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
      saleContractItemId,
    }),
  });
}

export function deleteSeedSale(saleId: string) {
  return apiFetch<Sale>(`/api/sales/${saleId}`, {
    method: "DELETE",
  });
}
