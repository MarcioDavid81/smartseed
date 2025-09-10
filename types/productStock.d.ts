import { Unit } from "@prisma/client";

export interface ProductStock {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        class: string;
        unit: Unit;
    };
    farmId: string;
    farm: {
        id: string;
        name: string;
    };
    stock: number;
    companyId: string;
}