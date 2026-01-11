import { AccountReceivable } from "@/types";
import { apiFetch } from "../api";

export async function getAccountReceivables(): Promise<AccountReceivable[]> {
  const data = await apiFetch<AccountReceivable[]>(
    `/api/financial/receivables`,
  );
  return data;
}