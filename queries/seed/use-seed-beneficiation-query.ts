import { getBeneficiationsByCycle } from "@/services/seed/seedBeneficiation";
import { useQuery } from "@tanstack/react-query";

export function useSeedBeneficiationsByCycle(cycleId: string) {
  return useQuery({
    queryKey: ["seed-beneficiation", cycleId],
    queryFn: () => getBeneficiationsByCycle(cycleId),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}