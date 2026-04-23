import { useQuery } from "@tanstack/react-query";
import { getIndustryStock, IndustryStockFilters } from "@/services/industry/industryStock";

export function useIndustryStock(filters?: IndustryStockFilters) {
  return useQuery({
    queryKey: ["industry-stock", filters],
    queryFn: () => getIndustryStock(filters),
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
}