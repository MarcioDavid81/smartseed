import { getSeedSalesByCycle } from "@/services/seed/seedSale";
import { useQuery } from "@tanstack/react-query";

export function useSeedSalesByCycle(cycleId: string) {
  return useQuery({
    queryKey: ["seed-sale", cycleId],
    queryFn: () => getSeedSalesByCycle(cycleId),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}