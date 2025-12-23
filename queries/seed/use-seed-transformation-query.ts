import { getSeedTransformation } from "@/services/seed/seedTransformation";
import { useQuery } from "@tanstack/react-query";

export function useSeedTransformation() {
  return useQuery({
    queryKey: ["transformation"],
    queryFn: () => getSeedTransformation(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}