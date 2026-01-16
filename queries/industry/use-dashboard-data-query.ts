import { useQuery } from "@tanstack/react-query";
import { getIndustryDashboardData } from "@/services/industry/industryDashboardData";

export function useIndustryDashboardData(selectedCycleId?: string) {
  return useQuery({
    queryKey: ["industryDashboardData", selectedCycleId],
    queryFn: () => getIndustryDashboardData(selectedCycleId!),
    enabled: !!selectedCycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
