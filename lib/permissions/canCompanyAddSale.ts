import { db } from "../prisma";
import { getCompanyIdAndPlan } from "./utils";

export async function canCompanyAddSale() {
  const data = await getCompanyIdAndPlan();
  if (!data) return false;

  const { companyId, plan } = data;

  if (plan === "PREMIUM") return true;

  const count = await db.saleExit.count({
    where: { companyId },
  });

  return count < 1; // limite do plano BASIC
}
