import { getSeedHarvestByCycle } from "@/services/seed/seedHarvest";
import { useQuery } from "@tanstack/react-query";

export function useSeedHarvestsByCycle(cycleId: string) {
  return useQuery({
    queryKey: ["seed-harvest", cycleId],
    queryFn: () => getSeedHarvestByCycle(cycleId),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}