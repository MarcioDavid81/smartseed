import { Unit, InsumoOperationType } from "@prisma/client";

export interface Transfer {
    id: string;
    date: Date;
    productId: string;
    product: {
        id: string;
        name: string;
        unit: Unit;
    };
    quantity: number;
    originFarmId: string;
    originFarm: {
        id: string;
        name: string;
    };
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
