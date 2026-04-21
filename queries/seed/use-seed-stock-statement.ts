import { getSeedStockStatement } from "@/services/seed/seedStockStatement";
import { useQuery } from "@tanstack/react-query";

export function useSeedStockStatement(
  cultivarId: string,
) {
  return useQuery({
    queryKey: ["seed-stock", cultivarId],
    queryFn: () => getSeedStockStatement(cultivarId),
    enabled: Boolean(cultivarId),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}