import { Beneficiation, Buy, ConsumptionExit, Harvest, ProductType, SaleExit } from "@prisma/client";

export interface Cycle {
    id: string;
    name: string;
    productType: ProductType;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    companyId: string;
    harvests: Harvest[];
    buys: Buy[];
    beneficiations: Beneficiation[];
    consumptionExits: ConsumptionExit[];
    salesExits: SaleExit[];
    createdAt: Date;
}