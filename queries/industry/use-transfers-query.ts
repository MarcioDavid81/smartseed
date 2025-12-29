import { useQuery } from "@tanstack/react-query";
import { getIndustryTransfers } from "@/services/industry/industryTransfer";

export function useIndustryTransfers() {
  return useQuery({
    queryKey: ["industry-transfer"],
    queryFn: () => getIndustryTransfers(),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}