import { ConsumptionExit, Talhao } from "@prisma/client";

export interface Farm {
    id: string;
    name: string;
    talhoes: Talhao[];
    area: number;
    comsumptionsExit: ConsumptionExit[];
    companyId: string;
    createdAt: Date;
}