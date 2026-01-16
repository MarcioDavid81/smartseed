import {
  CompanyAction,
  ForbiddenPlanError,
  PlanLimitReachedError,
  PLAN_RULES,
  getUsageCount,
} from "../access-control";
import { downgradeCompanyPlanIfExpired } from "./downgrade-company-plan-if-expired";

type AssertCompanyPlanAccessInput = {
  companyId: string;
  action: CompanyAction;
};

export async function assertCompanyPlanAccess({
  companyId,
  action,
}: AssertCompanyPlanAccessInput) {
  const company = await downgradeCompanyPlanIfExpired(companyId);

  const rules = PLAN_RULES[company?.plan ?? "BASIC"];

  if (!rules) {
    throw new ForbiddenPlanError("Plano inválido");
  }

  const rule = rules[action];

  if (rule === false) {
    throw new ForbiddenPlanError(
      `Seu plano atual (${company.plan}) não permite esta ação`,
    );
  }

  if (rule === true || rule === Infinity) {
    return company.plan;
  }

  if (typeof rule === "object") {
    const used = await getUsageCount(companyId, action);

    if (used >= rule.max) {
      throw new PlanLimitReachedError(
        `Seu plano atual (${company.plan}) atingiu o limite para esta ação`,
      );
    }
  }

  return company.plan;
}
