export interface Beneficiation {
    id: string;
    rawEntryId: string;
    date: Date;
    inputKg: number;
    outputKg: number;
    wasteKg: number;
    notes?: string;
    userId: string;
    createdAt: Date;
  }