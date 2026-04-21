export type SeedMovementType = "ENTRY" | "EXIT"

export type SeedOrigin = "HARVEST" | "BUY" | "SALE" | "CONSUMPTION" | "BENEFICIATION" | "ADJUSTMENT" | "TRANSFORMATION"

export type SeedStockStatementItem = {
  id: string
  date: Date
  quantity: number
  type: SeedMovementType
  origin: SeedOrigin
  description: string
  balance: number
}