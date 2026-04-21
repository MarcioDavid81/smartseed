import { SeedStockStatementItem } from "@/types";
import { apiFetch } from "../api";

export async function getSeedStockStatement(
  cultivarId: string,
): Promise<SeedStockStatementItem[]> {
  const data = await apiFetch<SeedStockStatementItem[]>(
    `/api/cultivars/${cultivarId}/extract`
  );

  return data;
}