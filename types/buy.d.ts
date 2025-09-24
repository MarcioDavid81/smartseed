import { AccountPayable, PaymentCondition } from "@prisma/client"

export interface Buy {
    id: string
    cultivarId: string
    cultivar: {
        id: string
        name: string
    }
    date: Date
    invoice: string
    unityPrice: number
    totalPrice: number
    customerId: string
    customer: {
        id: string
        name: string
    }
    quantityKg: number
    notes?: string
    companyId: string
    cycleId?: string | null
    paymentCondition?: PaymentCondition
    dueDate?: Date
    accountPayable?: AccountPayable | null
    createdAt: Date
}