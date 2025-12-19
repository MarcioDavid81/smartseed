import { getSeedAdjustStock } from "@/services/seed/seedAdjustmentStock";
import { useQuery } from "@tanstack/react-query";

export function useSeedAdjustStock() {
  return useQuery({
    queryKey: ["seed-adjust"],
    queryFn: () => getSeedAdjustStock(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}