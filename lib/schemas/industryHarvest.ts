import z from "zod";

export const industryHarvestSchema = z.object({
  date: z.string().min(1, "Data da colheita é obrigatória"),
  document: z.string().optional(),
  productId: z.string().min(1, "Produto da colheita é obrigatório"),
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
  humidity_percent: z.number().min(0, "Porcentagem de umidade é obrigatória"),
  humidity_discount: z.number().min(0, "Desconto da umidade é obrigatório"),
  humidity_kg: z.number().min(0, "Peso da umidade é obrigatório"),
  impurities_percent: z
    .number()
    .min(0, "Porcentagem de impurezas é obrigatória"),
  impurities_discount: z
    .number()
    .min(0, "Desconto das impurezas é obrigatório"),
  impurities_kg: z.number().min(0, "Peso das impurezas é obrigatório"),
  weightLiq: z.number().min(1, "Peso líquido é obrigatório"),
  cycleId: z.string().min(1, "Ciclo da colheita é obrigatório"),
});

export type IndustryHarvestFormData = z.infer<typeof industryHarvestSchema>;