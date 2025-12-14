import { getFuelTank } from "@/services/machines/fuelTank";
import { useQuery } from "@tanstack/react-query";

export function useFuelTank() {
  return useQuery({
    queryKey: ["fuelTanks"],
    queryFn: () => getFuelTank(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}
