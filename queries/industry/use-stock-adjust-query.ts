import { getIndustryAdjustStock } from "@/services/industry/industryAdjustmentStock";
import { useQuery } from "@tanstack/react-query";

export function useIndustryAdjustStock() {
  return useQuery({
    queryKey: ["industry-adjust"],
    queryFn: () => getIndustryAdjustStock(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}
