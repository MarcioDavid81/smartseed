import { SeedAdjustStock } from "@/types";
import { apiFetch } from "../api";
import { SeedAdjustStock as SeedAdjustStockFormData } from "@/lib/schemas/seedAdjustStockSchema";

export async function getSeedAdjustStock(): Promise<SeedAdjustStock[]> {
  const data = await apiFetch<SeedAdjustStock[]>(
    "/api/seed-adjust"
  );

  return data;
}

type CreateSeedAdjustStockParams = {
  data: SeedAdjustStockFormData;
  cycleId: string;
}

export async function createSeedAdjustStock({
  data,
  cycleId,
}: CreateSeedAdjustStockParams) {
  return apiFetch<SeedAdjustStock>(
    "/api/seed-adjust",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
        cycleId,
      }),
    }
  );
}

export async function deleteSeedAdjustStock(seedAdjustId: string) {
  return apiFetch<SeedAdjustStock>(
    `/api/seed-adjust/${seedAdjustId}`,
    {
      method: "DELETE",
    }
  );
}