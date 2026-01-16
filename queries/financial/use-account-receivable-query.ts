import { useQuery } from "@tanstack/react-query";
import { getAccountReceivables } from "@/services/financial/receivable";

export function useAccountReceivables() {
  return useQuery({
    queryKey: ["account-receivables"],
    queryFn: () => getAccountReceivables(),
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}