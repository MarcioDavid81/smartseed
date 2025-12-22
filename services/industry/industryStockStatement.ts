import { IndustryStockStatementItem } from "@/types";
import { apiFetch } from "../api";
import { ProductType } from "@prisma/client";

export async function getIndustryStockStatement(
  product: ProductType,
  depositId: string,
): Promise<IndustryStockStatementItem[]> {
  const data = await apiFetch<IndustryStockStatementItem[]>(
    `/api/industry/stock-statement?product=${product}&depositId=${depositId}`
  );

  return data;
}