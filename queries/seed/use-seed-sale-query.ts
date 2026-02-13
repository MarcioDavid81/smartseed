import { getSeedSalesByCycle } from "@/services/seed/seedSale";
import { useQuery } from "@tanstack/react-query";

export function useSeedSalesByCycle() {
  return useQuery({
    queryKey: ["seed-sale"],
    queryFn: () => getSeedSalesByCycle(),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}