import { ProductType, SaleContractType, Unit } from "@prisma/client"

export interface SaleContractItem {
  id: string,
  saleContractId:  string,
  saleContract: {
    id: string,
    type: SaleContractType,
    date: Date,
    document: string,
    customerId: string,
    customer: {
      id: string,
      name: string,
    },
  },
  product?: ProductType,
  cultivarId?: string,
  cultivar?: {
    id: string,
    name: string
  },
  description?: string,
  quantity: number,
  unit: Unit,
  unityPrice: number,
  totalPrice: number,
  fulfilledQuantity: number,
}