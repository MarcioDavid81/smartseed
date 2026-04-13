import { AccountReceivable, PaymentCondition } from "@prisma/client"

export interface Sale {
    id: string
    cultivarId: string
    cultivar: {
        id: string
        name: string
    }
    date: Date
    quantityKg: number
    customerId?: string
    customer: {
        id: string
        name: string
    }
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
    invoiceNumber?: string
    saleValue: number
    notes?: string
    paymentCondition?: PaymentCondition
    dueDate?: Date
    accountReceivable?: AccountReceivable | null
    companyId: string
    cycleId: string
    createdAt: Date
}