import { Transformation } from "@/types";
import { apiFetch } from "../api";
import { SeedTransformationFormData } from "@/lib/schemas/transformation";

export async function getSeedTransformation(): Promise<Transformation[]> {
  const data = await apiFetch<Transformation[]>(
    "/api/transformation"
  );

  return data;
}
export async function createSeedTransformation({
  data,
}: {
  data: SeedTransformationFormData;
}) {
  return apiFetch<Transformation>(
    "/api/transformation",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
      }),
    }
  );
}

export async function deleteSeedTransformation(seedTransformationId: string) {
  return apiFetch<Transformation>(
    `/api/transformation/${seedTransformationId}`,
    {
      method: "DELETE",
    }
  );
}