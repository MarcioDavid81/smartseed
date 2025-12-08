export type IndustryStockStatementItem = {
  id: string
  date: Date
  quantity: number
  type: "ENTRY" | "EXIT"
  origin: "HARVEST" | "SALE" | "TRANSFER"
  description: string
  relatedDeposit?: string
  balance?: number
}
