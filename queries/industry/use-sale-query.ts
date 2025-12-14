import { getIndustrySalesByCycle } from "@/services/industry/industrySale";
import { useQuery } from "@tanstack/react-query";

export function useIndustrySales(cycleId?: string) {
  return useQuery({
    queryKey: ["industrySales", cycleId],
    queryFn: () => getIndustrySalesByCycle(cycleId!),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}