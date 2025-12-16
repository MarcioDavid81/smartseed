import { getFuelPurchase } from "@/services/machines/fuelPurchase";
import { useQuery } from "@tanstack/react-query";

export function useFuelPurchase() {
  return useQuery({
    queryKey: ["fuelPurchases"],
    queryFn: () => getFuelPurchase(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}
