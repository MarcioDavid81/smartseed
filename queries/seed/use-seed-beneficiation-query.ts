import { getBeneficiationsByCycle } from "@/services/seed/seedBeneficiation";
import { useQuery } from "@tanstack/react-query";

export function useSeedBeneficiationsByCycle(cycleId: string) {
  return useQuery({
    queryKey: ["seed-beneficiation", cycleId],
    queryFn: () => getBeneficiationsByCycle(cycleId),
    enabled: !!cycleId,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}