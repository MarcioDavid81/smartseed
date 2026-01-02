import { Cycle } from "@/types";
import { apiFetch } from "../api";

export async function getCycles(): Promise<Cycle[]> {
  const data = await apiFetch<Cycle[]>(
    `/api/cycles`
  );

  return data;
}