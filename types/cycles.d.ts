import { Beneficiation, Buy, ConsumptionExit, Harvest, SaleExit } from "@prisma/client";

export interface Cycle {
    id: string;
    name: string;
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