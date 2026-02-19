import { getIndustrySaleById, getIndustrySalesByCycle } from "@/services/industry/industrySale";
import { useQuery } from "@tanstack/react-query";

export function useIndustrySales() {
  return useQuery({
    queryKey: ["industrySales"],
    queryFn: () => getIndustrySalesByCycle(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

export function useIndustrySale(saleId: string) {
  return useQuery({
    queryKey: ["industrySale", saleId],
    queryFn: () => getIndustrySaleById(saleId),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}