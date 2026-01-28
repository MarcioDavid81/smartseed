import { InputStockStatementItem } from "@/types";
import { apiFetch } from "../api";

export async function getInputStockStatement(
  productId: string,
  farmId: string,
): Promise<InputStockStatementItem[]> {
  const data = await apiFetch<InputStockStatementItem[]>(
    `/api/insumos/stock-statement?productId=${productId}&farmId=${farmId}`
  );

  return data;
}