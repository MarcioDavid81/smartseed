import { PlanRules } from './types'

export const PLAN_RULES: PlanRules = {
  BASIC: {
    REGISTER_MOVEMENT: { max: 2 },
    CREATE_MASTER_DATA: { max: 2 },
    CREATE_USER: { max: 1 },
    FINANCIAL_OPERATION: false,
  },

  PREMIUM: {
    REGISTER_MOVEMENT: Infinity,
    CREATE_MASTER_DATA: Infinity,
    CREATE_USER: Infinity,
    FINANCIAL_OPERATION: true,
  },
}
