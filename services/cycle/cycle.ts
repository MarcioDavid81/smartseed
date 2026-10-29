import { apiFetch } from "../api";

export function deleteCycle(cycleId: string) {
  return apiFetch<{ message: string }>(`/api/cycles/${cycleId}`, {
    method: "DELETE",
  });
}