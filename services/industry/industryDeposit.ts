import { IndustryDeposit } from "@/types";
import { apiFetch } from "../api";
import { IndustryDepositFormData } from "@/lib/schemas/industryDepositSchema";

export async function getIndustryDeposits(): Promise<IndustryDeposit[]> {
  const data = await apiFetch<IndustryDeposit[]>(
    `/api/industry/deposit`,
  );
  return data;
}

export async function getIndustryDepositById(
  depositId: string,
): Promise<IndustryDeposit> {
  const data = await apiFetch<IndustryDeposit>(
    `/api/industry/deposit/${depositId}`,
  );
  return data;
}

type UpsertDepositParams = {
  data: IndustryDepositFormData;
  depositId?: string;
};

export function upsertIndustryDeposit({
  data,
  depositId,
}: UpsertDepositParams) {
  const url = depositId
    ? `/api/industry/deposit/${depositId}`
    : "/api/industry/deposit";

  const method = depositId ? "PUT" : "POST";

  return apiFetch<IndustryDeposit>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteIndustryDeposit(depositId: string) {
  return apiFetch<IndustryDeposit>(
    `/api/industry/deposit/${depositId}`,
    {
      method: "DELETE",
    },
  );
}
