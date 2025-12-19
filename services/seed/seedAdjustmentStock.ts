import { SeedAdjustStock } from "@/types";
import { apiFetch } from "../api";
import { SeedAdjustStock as SeedAdjustStockFormData } from "@/lib/schemas/seedAdjustStockSchema";

export async function getSeedAdjustStock(): Promise<SeedAdjustStock[]> {
  const data = await apiFetch<SeedAdjustStock[]>(
    "/api/seed-adjust"
  );

  return data;
}

export async function createSeedAdjustStock({
  data,
}: {
  data: SeedAdjustStockFormData;
}) {
  return apiFetch<SeedAdjustStock>(
    "/api/seed-adjust",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
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