import { getHarvestsByCycle } from "@/services/industry/industryHarvest";
import { useQuery } from "@tanstack/react-query";

export function useIndustryHarvests(cycleId?: string) {
  return useQuery({
    queryKey: ["industryHarvests", cycleId],
    queryFn: () => getHarvestsByCycle(cycleId!),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
