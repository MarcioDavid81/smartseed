import { useQuery } from "@tanstack/react-query";
import { getIndustryDepositById, getIndustryDeposits } from "@/services/industry/industryDeposit";

export function useIndustryDeposits() {
  return useQuery({
    queryKey: ["industry-deposit"],
    queryFn: () => getIndustryDeposits(),
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useIndustryDepositById(depositId?: string) {
  return useQuery({
    queryKey: ["industry-deposit", depositId],
    queryFn: () => getIndustryDepositById(depositId!),
    enabled: !!depositId,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
