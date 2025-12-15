import { IndustrySale } from "@/types";
import { apiFetch } from "../api";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";

export async function getIndustrySalesByCycle(
  cycleId: string
): Promise<IndustrySale[]> {
  const data = await apiFetch<IndustrySale[]>(
    `/api/industry/sale?cycleId=${cycleId}`
  );

  return data.filter((industrySale) => industrySale.weightLiq > 0 );
}

type UpsertSaleParams = {
  data: IndustrySaleFormData;
  cycleId: string;
  saleId?: string;
};

export function upsertIndustrySale({
  data,
  cycleId,
  saleId,
}: UpsertSaleParams) {
  const url = saleId
    ? `/api/industry/sale/${saleId}`
    : "/api/industry/sale";

  const method = saleId ? "PUT" : "POST";

  return apiFetch<IndustrySale>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteIndustrySale(saleId: string) {
  return apiFetch<IndustrySale>(`/api/industry/sale/${saleId}`, {
    method: "DELETE",
  });
}
