import { ProductStock } from "@/types";
import { apiFetch } from "../api";

export async function getInputStock(): Promise<ProductStock[]> {
  const data = await apiFetch<ProductStock[]>(
    "/api/insumos/stock"
  );

  return data;
}