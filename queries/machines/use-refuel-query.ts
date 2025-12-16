import { getRefuel } from "@/services/machines/refuel";
import { useQuery } from "@tanstack/react-query";

export function useRefuels() {
  return useQuery({
    queryKey: ["refuels"],
    queryFn: () => getRefuel(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}
