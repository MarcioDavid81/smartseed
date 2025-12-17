import { apiFetch } from "../api";

export interface MachinesDashboardResponse {
  totalMachines: number;
  totalFuelStock: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
}

export async function getMachinesDashboard(): Promise<MachinesDashboardResponse> {
  const data = await apiFetch<MachinesDashboardResponse>(
    "/api/machines/dashboard"
  );

  return data;
}
