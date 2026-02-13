import { getBuyByCycle } from "@/services/seed/seedBuy";
import { useQuery } from "@tanstack/react-query";

export function useSeedBuysByCycle() {
  return useQuery({
    queryKey: ["seed-buy"],
    queryFn: () => getBuyByCycle(),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}