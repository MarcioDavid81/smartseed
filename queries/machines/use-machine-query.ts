import { getMachines } from "@/services/machines/machines";
import { useQuery } from "@tanstack/react-query";

export function useMachines() {
  return useQuery({
    queryKey: ["machines"],
    queryFn: () => getMachines(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
