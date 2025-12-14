import { getMachines } from "@/services/machines/machines";
import { useQuery } from "@tanstack/react-query";

export function useMachines() {
  return useQuery({
    queryKey: ["machines"],
    queryFn: () => getMachines(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}
