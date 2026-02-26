import { Cycle, CycleDetails } from "@/types";
import { apiFetch } from "../api";
import { CycleStatus } from "@prisma/client";

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

type Params = {
  cycleId: string;
  status: CycleStatus;
}

export async function changeCycleStatus({ cycleId, status }: Params) {
  const data = await apiFetch<CycleStatus>(
    `/api/cycles/${cycleId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );

  return data;
}