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
    companyId: string
    cycleId: string
    createdAt: Date
}