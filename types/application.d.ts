import { Unit, InsumoOperationType } from "@prisma/client";

export interface Application {
    id: string;
    date: Date;
    productStockId: string;
    productStock: {
        productId: string
        product: {
            id: string;
            name: string;
            unit: Unit;
        }
        farmId: string
        farm: {
            id: string;
            name: string;
        }
    };
    quantity: number;
    talhaoId: string;
    talhao: {
        id: string;
        name: string;
        area: number;
        farmId: string;
        farm: {
            id: string;
            name: string;
        }
    };
    notes: string;
    type: InsumoOperationType;
    companyId: string;
    cycleId: string;
    createdAt: Date;
    updatedAt: Date;
}