import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "../prisma";
import { getJwtSecretKey } from "../auth";

export async function getCompanyIdAndPlan() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const { payload } = await jwtVerify(token, getJwtSecretKey());

  const companyId = payload.companyId as string;
  if (!companyId) return null;

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { plan: true },
  });

  if (!company) return null;

  return {
    companyId,
    plan: company.plan,
  };
}
