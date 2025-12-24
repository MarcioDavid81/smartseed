import { useQuery } from "@tanstack/react-query";
import { getIndustryTransporter } from "@/services/industry/industryTransporter";

export function useIndustryTransporter() {
  return useQuery({
    queryKey: ["industry-transporter"],
    queryFn: () => getIndustryTransporter(),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
