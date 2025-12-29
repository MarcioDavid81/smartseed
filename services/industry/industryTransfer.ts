import { IndustryTransfer } from "@/types";
import { apiFetch } from "../api";
import { CreateIndustryTransferFormData } from "@/lib/schemas/industryTransferSchema";

export async function getIndustryTransfers(): Promise<IndustryTransfer[]> {
  const data = await apiFetch<IndustryTransfer[]>(
    `/api/industry/transfer`,
  );
  return data;
}

type UpsertIndustryTransferParams = {
  data: CreateIndustryTransferFormData;
  transferId?: string;
};

export function upsertIndustryTransfer({
  data,
  transferId,
}: UpsertIndustryTransferParams) {
  const url = transferId
    ? `/api/industry/transfer/${transferId}`
    : "/api/industry/transfer";

  const method = transferId ? "PUT" : "POST";

  return apiFetch<IndustryTransfer>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteIndustryTransfer(transferId: string) {
  return apiFetch<IndustryTransfer>(
    `/api/industry/transfer/${transferId}`,
    {
      method: "DELETE",
    },
  );
}