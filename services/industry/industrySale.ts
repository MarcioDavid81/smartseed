import { IndustrySale } from "@/types";
import { apiFetch } from "../api";

export async function getIndustrySalesByCycle(
  cycleId: string
): Promise<IndustrySale[]> {
  const data = await apiFetch<IndustrySale[]>(
    `/api/industry/sale?cycleId=${cycleId}`
  );

  return data.filter((industrySale) => industrySale.weightLiq > 0 );
}
