import { getSeedBuyById, getSeedBuysByCycle } from "@/services/seed/seedBuy";
import { useQuery } from "@tanstack/react-query";

export function useSeedBuysByCycle() {
  return useQuery({
    queryKey: ["seed-buy"],
    queryFn: () => getSeedBuysByCycle(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useSeedBuy(
  buyId: string,
) {
  return useQuery({
    queryKey: ["seed-buy", buyId],
    queryFn: () => getSeedBuyById(buyId),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
