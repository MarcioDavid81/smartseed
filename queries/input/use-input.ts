import { getInputProducts } from "@/services/input/inputProduct";
import { Insumo } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useInputProductQuery() {
  return useQuery<Insumo[]>({
    queryKey: ["input-product"],
    queryFn: () => getInputProducts(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}