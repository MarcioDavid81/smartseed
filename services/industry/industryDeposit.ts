import { IndustryDeposit } from "@/types";
import { apiFetch } from "../api";

export async function getIndustryDepositById(
  depositId: string,
): Promise<IndustryDeposit> {
  const data = await apiFetch<IndustryDeposit>(
    `/api/industry/deposit/${depositId}`,
  );
  return data;
}
