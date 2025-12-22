import { Beneficiation } from "@/types";
import { apiFetch } from "../api";
import { BeneficiationFormData } from "@/lib/schemas/seedBeneficiationSchema";

export async function getBeneficiationsByCycle(
  cycleId: string
): Promise<Beneficiation[]> {
  const data = await apiFetch<Beneficiation[]>(
    `/api/beneficiation?cycleId=${cycleId}`
  );

  return data.filter((beneficiation) => beneficiation.quantityKg > 0);
}


type UpsertBeneficiationParams = {
  data: BeneficiationFormData;
  cycleId: string;
  beneficiationId?: string;
};

export function upsertBeneficiation({
  data,
  cycleId,
  beneficiationId,
}: UpsertBeneficiationParams) {
  const url = beneficiationId
    ? `/api/beneficiation/${beneficiationId}`
    : "/api/beneficiation";

  const method = beneficiationId ? "PUT" : "POST";

  return apiFetch<Beneficiation>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteBeneficiation(beneficiationId: string) {
  return apiFetch<Beneficiation>(`/api/beneficiation/${beneficiationId}`, {
    method: "DELETE",
  });
}
