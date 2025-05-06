export interface Sale {
    id: string
    cultivarId: string
    date: Date
    quantityKg: number
    customerId?: string
    invoiceNumber?: string
    saleValue?: number
    notes?: string
    companyId: string
    createdAt: Date
}