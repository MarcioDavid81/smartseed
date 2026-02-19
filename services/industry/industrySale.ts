import { IndustrySale, IndustrySaleDetails } from "@/types";
import { apiFetch } from "../api";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";

export async function getIndustrySalesByCycle(
): Promise<IndustrySale[]> {
  const data = await apiFetch<IndustrySale[]>(
    `/api/industry/sale`
  );

  return data.filter((industrySale) => industrySale.weightLiq > 0 );
}

export async function getIndustrySaleById(
  saleId: string,
): Promise<IndustrySaleDetails> {
  const data = await apiFetch<IndustrySaleDetails>(
    `/api/industry/sale/${saleId}`
  );

  return data;
}

type UpsertSaleParams = {
  data: IndustrySaleFormData;
  saleId?: string;
  saleContractItemId?: string;
};

export function upsertIndustrySale({
  data,
  saleId,
  saleContractItemId,
}: UpsertSaleParams) {
  const url = saleId
    ? `/api/industry/sale/${saleId}`
    : "/api/industry/sale";

  const method = saleId ? "PUT" : "POST";

  return apiFetch<IndustrySale>(url, {
    method,
    body: JSON.stringify({
      ...data,
      saleContractItemId,
    }),
  });
}

export function deleteIndustrySale(saleId: string) {
  return apiFetch<IndustrySale>(`/api/industry/sale/${saleId}`, {
    method: "DELETE",
  });
}
