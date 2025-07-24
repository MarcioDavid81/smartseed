export interface Harvest {
    id: string
    cultivarId: string
    cultivar: {
        id: string
        name: string
    }
    date: Date
    quantityKg: number
    talhaoId: string
    talhao: {
        id: string
        name: string
        farm: {
            id: string
            name: string
        }
    }
    companyId: string
    notes: string
    cycleId: string
    createdAt: Date
}