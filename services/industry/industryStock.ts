import { IndustryStock } from "@/types";
import { apiFetch } from "../api";

export async function getIndustryStock(): Promise<IndustryStock[]> {
  const data = await apiFetch<IndustryStock[]>(
    "/api/industry/stock"
  );

  return data;
}