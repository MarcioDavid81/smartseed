import { AccountReceivable } from "@/types";
import { apiFetch } from "../api";

export interface AccountReceivableFilters {
  showReceivablePaid?: boolean;
}

export async function getAccountReceivables(filters?: AccountReceivableFilters): Promise<AccountReceivable[]> {
    const params = new URLSearchParams();

  if (filters?.showReceivablePaid) {
    params.set("showReceivablePaid", "true");
  }
  const query = params.toString();
  const data = await apiFetch<AccountReceivable[]>(
    `/api/financial/receivables${query ? `?${query}` : ""}`
  );
  return data;
}