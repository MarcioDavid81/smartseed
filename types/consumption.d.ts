export interface Consumption {
    id: string;
    cultivarId: string;
    date: string;
    quantityKg: number;
    farmId: string;
    notes?: string;
    companyId: string;
    createdAt: Date;
}