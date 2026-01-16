import { useQuery } from "@tanstack/react-query";
import { getIndustryTransporters } from "@/services/industry/industryTransporter";

export function useIndustryTransporters() {
  return useQuery({
    queryKey: ["industry-transporter"],
    queryFn: () => getIndustryTransporters(),
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
