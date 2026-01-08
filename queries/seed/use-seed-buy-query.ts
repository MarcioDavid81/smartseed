import { getBuyByCycle } from "@/services/seed/seedBuy";
import { useQuery } from "@tanstack/react-query";

export function useSeedBuysByCycle(cycleId: string) {
  return useQuery({
    queryKey: ["seed-buy", cycleId],
    queryFn: () => getBuyByCycle(cycleId),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}