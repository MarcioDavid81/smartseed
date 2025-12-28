import { CompanyAction } from "./company-actions"

export type PlanName = 'BASIC' | 'PREMIUM'

export type PlanRule =
  | boolean
  | number
  | {
      max: number
    }

export type PlanRules = Record<
  PlanName,
  Record<CompanyAction, PlanRule>
>
