import { ProductType } from "@prisma/client"


export interface IndustryDashboardData {
  summary: DashboardSummary
  fieldReports: FieldReport[]
  farmReports: FarmReport[]
}

export interface DashboardSummary {
  totalKg: number
  totalSc: number
  totalAreaHa: number
  avgProductivityKgHa: number
  avgProductivityScHa: number
}

export interface FieldReport {
  talhaoId: string
  talhaoName: string
  productType: ProductType
  totalKg: number
  totalSc: number
  areaHa: number
  productivityKgHa: number
  productivityScHa: number
  participationPercent: number
}

export interface FarmReport {
  farmId: string
  farmName: string
  totalKg: number
  totalSc: number
  totalAreaHa: number
  productivityKgHa: number
  productivityScHa: number
  participationPercent: number
}