import { useQuery } from "@tanstack/react-query";
import { AccountReceivableFilters, getAccountReceivables } from "@/services/financial/receivable";

export function useAccountReceivables(filters?: AccountReceivableFilters) {
  return useQuery({
    queryKey: ["account-receivables", filters],
    queryFn: () => getAccountReceivables(filters),
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}