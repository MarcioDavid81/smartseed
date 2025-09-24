import { AccountPayable, PaymentCondition } from "@prisma/client"

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
    invoiceNumber?: string
    saleValue: number
    notes?: string
    paymentCondition?: PaymentCondition
    dueDate?: Date
    accountPayable?: AccountPayable | null
    companyId: string
    cycleId: string
    createdAt: Date
}