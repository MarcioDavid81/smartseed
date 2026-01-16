import { db } from "@/lib/prisma";
import { Plan } from "@prisma/client";

export async function downgradeCompanyPlanIfExpired(companyId: string) {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      plan: true,
      planExpiresAt: true,
    },
  });

  if (!company) {
    throw new Error("Company não encontrada");
  }

  if (company.plan !== Plan.TRIAL) {
    return company;
  }

  if (!company.planExpiresAt) {
    return company;
  }

  const now = new Date();

  if (company.planExpiresAt > now) {
    return company;
  }

  // ⬇ downgrade automático APENAS do TRIAL
  return db.company.update({
    where: { id: company.id },
    data: {
      plan: Plan.BASIC,
      planStartedAt: now,
      planExpiresAt: null,
    },
  });
}
