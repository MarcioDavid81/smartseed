export type InputMovementType = "ENTRY" | "EXIT"

export type InputOrigin = "COMPRA" | "TRANSFERENCIA" | "APLICACAO"

export type InputStockStatementItem = {
  id: string
  date: Date
  productId: string
  productName: string
  farmId: string
  farmName: string
  operation: InputOrigin
  type: InputMovementType
  quantityIn: number
  quantityOut: number
  reference: string
  balance: number
}