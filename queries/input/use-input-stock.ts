import { ProductStock } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getInputStock } from "@/services/input/inputStock";

export function useInputStockQuery() {
  return useQuery<ProductStock[]>({
    queryKey: ["input-stock"],
    queryFn: () => getInputStock(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}