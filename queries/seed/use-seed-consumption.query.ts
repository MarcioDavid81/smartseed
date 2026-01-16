import { getConsumptionsByCycle } from "@/services/seed/seedConsumption";
import { useQuery } from "@tanstack/react-query";

export function useSeedConsumptionsByCycle(cycleId: string) {
  return useQuery({
    queryKey: ["seed-consumption", cycleId],
    queryFn: () => getConsumptionsByCycle(cycleId),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}