export const COMPANY_ACTIONS = [
  'REGISTER_MOVEMENT',
  'CREATE_MASTER_DATA',
  'CREATE_USER',
  'FINANCIAL_OPERATION',
] as const

export type CompanyAction = typeof COMPANY_ACTIONS[number]
