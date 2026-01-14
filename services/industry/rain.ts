import { Rain } from "@/types";
import { apiFetch } from "../api";
import { RainFormData } from "@/lib/schemas/rainSchema";

export async function getRains(): Promise<Rain[]> {
  const data = await apiFetch<Rain[]>(
    `/api/industry/rain`,
  );
  return data;
}


type UpsertRainParams = {
  data: RainFormData;
  rainId?: string;
};

export function upsertRain({
  data,
  rainId,
}: UpsertRainParams) {
  const url = rainId
    ? `/api/industry/rain/${rainId}`
    : "/api/industry/rain";

  const method = rainId ? "PUT" : "POST";

  return apiFetch<Rain>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteRain(rainId: string) {
  return apiFetch<Rain>(
    `/api/industry/rain/${rainId}`,
    {
      method: "DELETE",
    },
  );
}
