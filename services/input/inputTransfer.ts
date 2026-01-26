import { Transfer } from "@/types";
import { apiFetch } from "../api";
import { InputTransferFormData } from "@/lib/schemas/inputSchema";

export async function getInputTransfers(): Promise<Transfer[]> {
  const data = await apiFetch<Transfer[]>(
    "/api/insumos/transfers"
  );

  return data;
}

type UpsertInputTransferParams = {
  data: InputTransferFormData;
  transferId?: string;
};

export function upsertInputTransfer({
  data,
  transferId,
}: UpsertInputTransferParams) {
  const url = transferId
    ? `/api/insumos/transfers/${transferId}`
    : "/api/insumos/transfers";

  const method = transferId ? "PUT" : "POST";

  return apiFetch<Transfer>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteInputTransfer(transferId: string) {
  return apiFetch<Transfer>(`/api/insumos/transfers/${transferId}`, {
    method: "DELETE",
  });
}