import { Unit, InsumoOperationType } from "@prisma/client";

export interface Transfer {
    id: string;
    date: Date;
    productStockId: {
        productId: string;
        product: {
            id: string;
            name: string;
            unit: Unit;
        };
        farmId: string;
        farm: {
            id: string;
            name: string;
        };
    };
    quantity: number;
    destFarmId: string;
    destFarm: {
        id: string;
        name: string;
    };
    type: InsumoOperationType;
    companyId: string;
    cycleId?: string;
    createdAt: Date;
    updatedAt: Date;
}
