import { AccountPayable } from "@/types";
import { apiFetch } from "../api";

export async function getAccountPayables(): Promise<AccountPayable[]> {
  const data = await apiFetch<AccountPayable[]>(
    `/api/financial/payables`,
  );
  return data;
}