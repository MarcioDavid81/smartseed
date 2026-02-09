import { getIndustrySalesByCycle } from "@/services/industry/industrySale";
import { useQuery } from "@tanstack/react-query";

export function useIndustrySales() {
  return useQuery({
    queryKey: ["industrySales"],
    queryFn: () => getIndustrySalesByCycle(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}