import { getPlots } from "@/services/registrations/plot";
import { Talhao } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function usePlots() {
  return useQuery<Talhao[]>({
    queryKey: ["plots"],
    queryFn: () => getPlots(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}