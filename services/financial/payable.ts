import { AccountPayable } from "@/types";
import { apiFetch } from "../api";

export interface AccountPayableFilters {
  showPayablePaid?: boolean;
}

export async function getAccountPayables(filters?: AccountPayableFilters): Promise<AccountPayable[]> {
    const params = new URLSearchParams();

  if (filters?.showPayablePaid) {
    params.set("showPayablePaid", "true");
  }
  const query = params.toString();
  const data = await apiFetch<AccountPayable[]>(
    `/api/financial/payables${query ? `?${query}` : ""}`
  );
  return data;
}