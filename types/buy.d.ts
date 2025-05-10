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
    customerId?: string
    customer: {
        id: string
        name: string
    }
    quantityKg: number
    notes?: string
    companyId: string
    createdAt: Date
}