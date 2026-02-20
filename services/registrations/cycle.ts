import { Cycle, CycleDetails } from "@/types";
import { apiFetch } from "../api";

export async function getCycles(): Promise<Cycle[]> {
  const data = await apiFetch<Cycle[]>(
    `/api/cycles`
  );

  return data;
}

export async function getCycleById(id: string): Promise<CycleDetails> {
  const data = await apiFetch<CycleDetails>(
    `/api/cycles/${id}`
  );

  return data;
}