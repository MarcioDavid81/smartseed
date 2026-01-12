import { Talhao } from "@/types";
import { apiFetch } from "../api";
import { PlotFormData } from "@/lib/schemas/plotSchema";

export async function getPlots(): Promise<Talhao[]> {
  const data = await apiFetch<Talhao[]>(
    `/api/plots`
  );

  return data;
}

type UpsertPlotParams = {
  data: PlotFormData;
  plotId?: string;
};

export function upsertPlot({
  data,
  plotId,
}: UpsertPlotParams) {
  const url = plotId
    ? `/api/plots/${plotId}`
    : "/api/plots";

  const method = plotId ? "PUT" : "POST";

  return apiFetch<Talhao>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deletePlot(plotId: string) {
  return apiFetch<Talhao>(`/api/plots/${plotId}`, {
    method: "DELETE",
  });
}