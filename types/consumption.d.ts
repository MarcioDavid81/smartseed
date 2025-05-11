export interface Consumption {
    id: string;
    cultivarId: string;
    cultivar: {
        id: string;
        name: string;
    }
    date: string;
    quantityKg: number;
    farmId: string;
    farm: {
        id: string;
        name: string;
    }
    notes?: string;
    companyId: string;
    createdAt: Date;
}