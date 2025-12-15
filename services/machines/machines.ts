import { Machine } from "@/types";
import { apiFetch } from "../api";
import { MachineFormData } from "@/lib/schemas/machineSchema";

export async function getMachines(): Promise<Machine[]> {

  const data = await apiFetch<Machine[]>(
    "/api/machines/machine"
  );

  return data;
}

type UpsertMachineParams = {
  data: MachineFormData;
  machineId?: string;
};

export function upsertMachine({
  data,
  machineId,
}: UpsertMachineParams) {
  const url = machineId
    ? `/api/machines/machine/${machineId}`
    : "/api/machines/machine";

  const method = machineId ? "PUT" : "POST";

  return apiFetch<Machine>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteMachine(machineId: string) {
  return apiFetch<Machine>(`/api/machines/machine/${machineId}`, {
    method: "DELETE",
  });
}