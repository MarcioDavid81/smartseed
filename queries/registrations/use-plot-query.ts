import { getPlots } from "@/services/registrations/plot";
import { useQuery } from "@tanstack/react-query";

export function usePlots() {
  return useQuery({
    queryKey: ["plots"],
    queryFn: () => getPlots(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}