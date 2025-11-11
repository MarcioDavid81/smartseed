import { AccountReceivable, PaymentCondition, ProductType } from "@prisma/client"

export interface IndustrySale {
  id: string
  date: Date
  document?: string
  product: ProductType
  industryDepositId: string
  industryDeposit: {
    id: string
    name: string
  }
  customerId: string
  customer: {
    id: string
    name: string
  }
  industryTransporterId?: string
  industryTransporter?: {
    id: string
    name: string
  }
  truckPlate?: string
  truckDriver?: string
  weightBt: number
  weightTr: number
  weightSubLiq: number
  discountsKg: number
  weightLiq: number
  unitPrice: number
  totalPrice: number
  notes?: string
  paymentCondition?: PaymentCondition
  dueDate?: Date
  accountReceivable?: AccountReceivable | null
  companyId: string
  cycleId: string
}