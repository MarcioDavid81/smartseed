import z from "zod";

export const industryHarvestSchema = z.object({
  date: z.coerce.date(),
  document: z.string().optional(),
  talhaoId: z.string().min(1, "Talhão da colheita é obrigatório"),
  industryDepositId: z
    .string()
    .min(1, "Depósito de destino da colheita é obrigatório"),
  industryTransporterId: z.string().optional(),
  truckPlate: z.string().optional(),
  truckDriver: z.string().optional(),
  weightBt: z.coerce.number().min(1, "Peso bruto é obrigatório"),
  weightTr: z.coerce.number().min(1, "Peso da tara é obrigatório"),
  weightSubLiq: z.coerce.number().min(1, "Peso sub-líquido é obrigatório"),
  humidity_percent: z.coerce.number(),
  humidity_discount: z.coerce.number(),
  humidity_kg: z.coerce.number(),
  impurities_percent: z.coerce.number(),
  impurities_discount: z.coerce.number(),
  impurities_kg: z.coerce.number(),
  tax_kg: z.coerce.number().optional(),
  adjust_kg: z.coerce.number().optional(),
  weightLiq: z.coerce.number().min(1, "Peso líquido é obrigatório"),
  cycleId: z.string().optional(),
});

export type IndustryHarvestFormData = z.infer<typeof industryHarvestSchema>;