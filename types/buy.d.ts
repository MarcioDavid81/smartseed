export interface Buy {
    id: string
    cultivarId: string
    date: Date
    invoice: string
    unityPrice: number
    totalPrice: number
    customerId?: string
    quantityKg: number
    notes?: string
    companyId: string
    createdAt: Date
}