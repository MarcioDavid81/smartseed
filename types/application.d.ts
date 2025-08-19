import { Unit, InsumoOperationType } from "@prisma/client";

export interface Application {
    id: string;
    date: Date;
    productId: string;
    product: {
        id: string;
        name: string;
    };
    unit: Unit;
    quantity: number;
    farmId: string;
    farm: {
        id: string;
        name: string;
    };
    talhaoId: string;
    talhao: {
        id: string;
        name: string;
    };
    notes: string;
    type: InsumoOperationType;
    companyId: string;
    cycleId: string;
    createdAt: Date;
    updatedAt: Date;
}