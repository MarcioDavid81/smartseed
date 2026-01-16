import { getFuelTank } from "@/services/machines/fuelTank";
import { useQuery } from "@tanstack/react-query";

export function useFuelTank() {
  return useQuery({
    queryKey: ["fuelTanks"],
    queryFn: () => getFuelTank(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
