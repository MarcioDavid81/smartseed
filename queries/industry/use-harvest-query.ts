import { getHarvestById } from "@/services/industry/industryHarvest";
import { useQuery } from "@tanstack/react-query";

export function useIndustryHarvest(harvestId?: string | null) {
  return useQuery({
    queryKey: ["industryHarvest", harvestId],
    queryFn: () => getHarvestById(harvestId!),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}
