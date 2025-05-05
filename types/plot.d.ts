import { Harvest } from "@prisma/client";

export interface Talhao {
    id: string;
    name: string;
    area: number;
    companyId: string;
    farmId: string;
    harvests: Harvest[];
    createdAt: Date;
};