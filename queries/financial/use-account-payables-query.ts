import { useQuery } from "@tanstack/react-query";
import { AccountPayableFilters, getAccountPayables } from "@/services/financial/payable";

export function useAccountPayables(filters?: AccountPayableFilters) {
  return useQuery({
    queryKey: ["account-payables", filters],
    queryFn: () => getAccountPayables(filters),
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}