import { useQuery } from "@tanstack/react-query";
import { getIndustryDeposits } from "@/services/industry/industryDeposit";

export function useIndustryDeposits() {
  return useQuery({
    queryKey: ["industry-deposit"],
    queryFn: () => getIndustryDeposits(),
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
