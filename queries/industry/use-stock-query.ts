import { getIndustryStock } from "@/services/industry/industryStock";
import { useQuery } from "@tanstack/react-query";

export function useIndustryStock() {
  return useQuery({
    queryKey: ["industry-stock"],
    queryFn: () => getIndustryStock(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
