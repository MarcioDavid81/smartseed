import { getIndustryAdjustStock } from "@/services/industry/industryAdjustmentStock";
import { useQuery } from "@tanstack/react-query";

export function useIndustryAdjustStock() {
  return useQuery({
    queryKey: ["industry-adjust"],
    queryFn: () => getIndustryAdjustStock(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
