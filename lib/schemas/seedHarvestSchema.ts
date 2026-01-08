import { z } from "zod";

export const seedHarvestSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  date: z.coerce.date(),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  talhaoId: z.string().min(1, "Selecione um talhão"),
  notes: z.string().optional(),
  cycleId: z.string().optional(),
})

export type SeedHarvestFormData = z.infer<typeof seedHarvestSchema>;
