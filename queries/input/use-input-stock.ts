import { InputStockStatementItem, ProductStock } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getInputStock, InputStockFilters } from "@/services/input/inputStock";
import { getInputStockStatement } from "@/services/input/inputStockStatement";

export function useInputStockQuery(filters: InputStockFilters) {
  return useQuery<ProductStock[]>({
    queryKey: ["input-stock", filters],
    queryFn: () => getInputStock(filters),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useInputStockStatementQuery(
  productId: string,
  farmId: string,
) {
  return useQuery<InputStockStatementItem[]>({
    queryKey: ["input-stock", productId, farmId],
    queryFn: () => getInputStockStatement(productId, farmId),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
