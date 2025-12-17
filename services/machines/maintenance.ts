import { Maintenance } from "@/types";
import { apiFetch } from "../api";
import { MaintenanceFormData } from "@/lib/schemas/maintenanceSchema";

export async function getMaintenance(): Promise<Maintenance[]> {
  const data = await apiFetch<Maintenance[]>(
    "/api/machines/maintenance"
  );

  return data;
}

type UpsertMaintenanceParams = {
  data: MaintenanceFormData;
  maintenanceId?: string;
};

export function upsertMaintenance({
  data,
  maintenanceId,
}: UpsertMaintenanceParams) {
  const url = maintenanceId
    ? `/api/machines/maintenance/${maintenanceId}`
    : "/api/machines/maintenance";

  const method = maintenanceId ? "PUT" : "POST";

  return apiFetch<Maintenance>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteMaintenance(maintenanceId: string) {
  return apiFetch<Maintenance>(
    `/api/machines/maintenance/${maintenanceId}`, {
      method: "DELETE",
    });
}
