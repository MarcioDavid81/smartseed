import { getSeedSaleById, getSeedSalesByCycle } from "@/services/seed/seedSale";
import { useQuery } from "@tanstack/react-query";

export function useSeedSalesByCycle() {
  return useQuery({
    queryKey: ["seed-sale"],
    queryFn: () => getSeedSalesByCycle(),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useSeedSale(saleId: string) {
  return useQuery({
    queryKey: ["seed-sale", saleId],
    queryFn: () => getSeedSaleById(saleId),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}