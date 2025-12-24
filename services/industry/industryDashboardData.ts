import { IndustryDashboardData } from "@/types";
import { apiFetch } from "../api";

export async function getIndustryDashboardData(
  selectedCycleId: string,
): Promise<IndustryDashboardData> {
  const data = await apiFetch<IndustryDashboardData>(
    `/api/reports/cycle-yield/${selectedCycleId}`
  );

  return data;
}