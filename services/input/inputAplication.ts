import { apiFetch } from "../api";
import { Application } from "@/types/application";
import { InputApplicationFormData } from "@/lib/schemas/inputSchema";

export async function getInputApplicationsByCycle(
  cycleId: string
): Promise<Application[]> {
  const data = await apiFetch<Application[]>(
    `/api/insumos/applications?cycleId=${cycleId}`
  );

  return data.filter((application) => application.quantity > 0);
}

type UpsertApplicationParams = {
  data: InputApplicationFormData;
  cycleId: string;
  applicationId?: string;
};

export function upsertInputApplication({
  data,
  cycleId,
  applicationId,
}: UpsertApplicationParams) {
  const url = applicationId
    ? `/api/insumos/applications/${applicationId}`
    : "/api/insumos/applications";

  const method = applicationId ? "PUT" : "POST";

  return apiFetch<Application>(url, {
    method,
    body: JSON.stringify({
      ...data,
      cycleId,
    }),
  });
}

export function deleteInputApplication(applicationId: string) {
  return apiFetch<Application>(
    `/api/insumos/applications/${applicationId}`,
    {
      method: "DELETE",
    }
  );
}
