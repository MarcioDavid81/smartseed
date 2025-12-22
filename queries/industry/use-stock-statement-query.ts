import { getIndustryStockStatement } from "@/services/industry/industryStockStatement";
import { useQuery } from "@tanstack/react-query";
import { ProductType } from "@prisma/client";

export function useIndustryStockStatement(
  product: ProductType,
  depositId: string,
) {
  return useQuery({
    queryKey: ["industry-stock", product, depositId],
    queryFn: () => getIndustryStockStatement(product, depositId),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });
}