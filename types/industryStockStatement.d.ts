export type IndustryMovementType = "ENTRY" | "EXIT"

export type IndustryOrigin = "HARVEST" | "DISCARD" | "SALE" | "TRANSFER"

export type IndustryStockStatementItem = {
  id: string
  date: Date
  quantity: number
  type: IndustryMovementType
  origin: IndustryOrigin
  description: string
  relatedDeposit?: string
  balance?: number
}
