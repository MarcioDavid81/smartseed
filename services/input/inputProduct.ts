import { Insumo } from "@/types";
import { apiFetch } from "../api";

export async function getInputProducts(): Promise<Insumo[]> {
  const data = await apiFetch<Insumo[]>(
    "/api/insumos/products"
  );

  return data;
}