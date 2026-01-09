import { z } from "zod";

export const consumptionSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  talhaoId: z.string().min(1, "Selecione um talhão"),
  date: z.coerce.date(),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  notes: z.string().optional(),
  cycleId: z.string().optional(),
});

export type ConsumptionFormData = z.infer<typeof consumptionSchema>;
