import { useQuery } from "@tanstack/react-query";
import { getIndustryDepositById } from "@/services/industry/industryDeposit";

export function useIndustryDeposit(depositId?: string) {
  return useQuery({
    queryKey: ["industry-deposit", depositId],
    queryFn: () => getIndustryDepositById(depositId!),
    enabled: !!depositId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
