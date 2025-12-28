import { db } from '@/lib/prisma'
import { PLAN_RULES } from './plan-rules'
import { CompanyAction } from './company-actions'
import { getUsageCount } from './usage-counter'
import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from './errors'

export async function ensureCompanyCan(
  companyId: string,
  action: CompanyAction
) {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { plan: true },
  })

  if (!company) {
    throw new ForbiddenPlanError()
  }

  const rule = PLAN_RULES[company?.plan ?? 'BASIC'][action]

  if (rule === false) {
    throw new ForbiddenPlanError()
  }

  if (rule === true || rule === Infinity) {
    return
  }

  if (typeof rule === 'object') {
    const used = await getUsageCount(companyId, action)

    if (used >= rule.max) {
      throw new PlanLimitReachedError()
    }
  }
}
