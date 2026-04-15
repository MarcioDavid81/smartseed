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
    memberId?: string | null
    member?: {
      id: string
      name: string
      email: string
      phone: string
      cpf: string
    }
    memberAdressId?: string | null
    memberAdress?: {
      id: string
      stateRegistration: string
      zip: string
      adress: string
      number: string
      complement: string
      district: string
      state: string
      city: string
    }
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