import { IndustryTransporter } from "@/types";
import { apiFetch } from "../api";
import { IndustryTransporterFormData } from "@/lib/schemas/industryTransporter";

export async function getIndustryTransporters(): Promise<IndustryTransporter[]> {
  const data = await apiFetch<IndustryTransporter[]>(
    `/api/industry/transporter`,
  );
  return data;
}

type UpsertTransporterParams = {
  data: IndustryTransporterFormData;
  transporterId?: string;
};

export function upsertIndustryTransporter({
  data,
  transporterId,
}: UpsertTransporterParams) {
  const url = transporterId
    ? `/api/industry/transporter/${transporterId}`
    : "/api/industry/transporter";

  const method = transporterId ? "PUT" : "POST";

  return apiFetch<IndustryTransporter>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteIndustryTransporter(transporterId: string) {
  return apiFetch<IndustryTransporter>(
    `/api/industry/transporter/${transporterId}`,
    {
      method: "DELETE",
    },
  );
}
