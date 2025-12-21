import { IndustryAdjustStock } from "@/types";
import { apiFetch } from "../api";
import { IndustryAdjustStockFormData } from "@/lib/schemas/industryAdjustStockSchema";

export async function getIndustryAdjustStock(): Promise<IndustryAdjustStock[]> {
  const data = await apiFetch<IndustryAdjustStock[]>(
    "/api/industry/stock-adjust"
  );

  return data;
}

export async function createIndustryAdjustStock({
  data,
}: {
  data: IndustryAdjustStockFormData;
}) {
  return apiFetch<IndustryAdjustStock>(
    "/api/industry/stock-adjust",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
      }),
    }
  );
}

export async function deleteIndustryAdjustStock(industryAdjustId: string) {
  return apiFetch<IndustryAdjustStock>(
    `/api/industry/stock-adjust/${industryAdjustId}`,
    {
      method: "DELETE",
    }
  );
}