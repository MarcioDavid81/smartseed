import { getCycles } from "@/services/registrations/cycle";
import { useQuery } from "@tanstack/react-query";

export function useCycles() {
  return useQuery({
    queryKey: ["cycles"],
    queryFn: () => getCycles(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}