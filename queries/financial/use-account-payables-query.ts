import { useQuery } from "@tanstack/react-query";
import { getAccountPayables } from "@/services/financial/payable";

export function useAccountPayables() {
  return useQuery({
    queryKey: ["account-payables"],
    queryFn: () => getAccountPayables(),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}