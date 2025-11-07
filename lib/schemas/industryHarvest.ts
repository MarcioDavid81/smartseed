import z from "zod";

export const industryHarvestSchema = z.object({
  date: z.string().min(1, "Data da colheita é obrigatória"),
  document: z.string().optional(),
  talhaoId: z.string().min(1, "Talhão da colheita é obrigatório"),
  industryDepositId: z
    .string()
    .min(1, "Depósito de destino da colheita é obrigatório"),
  industryTransporterId: z.string().optional(),
  truckPlate: z.string().optional(),
  truckDriver: z.string().optional(),
  weightBt: z.number().min(1, "Peso bruto é obrigatório"),
  weightTr: z.number().min(1, "Peso da tara é obrigatório"),
  weightSubLiq: z.number().min(1, "Peso sub-líquido é obrigatório"),
  humidity_percent: z.number(),
  humidity_discount: z.number(),
  humidity_kg: z.number(),
  impurities_percent: z.number(),
  impurities_discount: z.number(),
  impurities_kg: z.number(),
  tax_kg: z.number().optional(),
  adjust_kg: z.number().optional(),
  weightLiq: z.number().min(1, "Peso líquido é obrigatório"),
  cycleId: z.string().optional(),
});

export type IndustryHarvestFormData = z.infer<typeof industryHarvestSchema>;