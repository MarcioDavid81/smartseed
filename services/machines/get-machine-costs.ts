import { apiFetch } from "../api";

export type MachineDashboardResponse = {
  machine: {
    id: string
    name: string
  }
  totals: {
    fuel: number
    liters: number
    maintenance: number
    total: number
  }
  monthly: {
    month: string
    fuel: number
    maintenance: number
  }[]
}

export async function getMachineCostsDashboard(machineId: string) {
  const data = await apiFetch<MachineDashboardResponse>(
    `/api/machines/machine/${machineId}/dashboard`
  )
  return data
}
