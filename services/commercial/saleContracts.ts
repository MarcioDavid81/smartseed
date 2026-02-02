import { SaleContract } from "@/types";
import { apiFetch } from "../api";
import { SaleContractFormData } from "@/lib/schemas/saleContractSchema";

export async function getSaleContracts(): Promise<SaleContract[]> {
  const data = await apiFetch<SaleContract[]>(
    `/api/commercial/sale-contracts`
  );

  return data;
}

export async function getSaleContractById(
  saleContractId: string,
): Promise<SaleContract> {
  const data = await apiFetch<SaleContract>(
    `/api/commercial/sale-contracts/${saleContractId}`,
  );
  return data;
}

type UpsertSaleContractParams = {
  data: SaleContractFormData;
  saleContractId?: string;
};

export function upsertSaleContract({
  data,
  saleContractId,
}: UpsertSaleContractParams) {
  const url = saleContractId
    ? `/api/commercial/sale-contracts/${saleContractId}`
    : "/api/commercial/sale-contracts";

  const method = saleContractId ? "PUT" : "POST";

  return apiFetch<SaleContract>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteSaleContract(saleContractId: string) {  
  return apiFetch<SaleContract>(`/api/commercial/sale-contracts/${saleContractId}`, {
    method: "DELETE",
  });
}
