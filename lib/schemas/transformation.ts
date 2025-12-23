import z from "zod";

export const seedTransformationSchema = z.object({
  date: z.coerce.date(),
  cultivarId: z.string().min(1, "Cultivar é obrigatório"),
  destinationId: z.string().min(1, "Destino é obrigatório"),
  quantityKg: z.coerce.number().min(1, "Quantidade em kg é obrigatória"),
  notes: z.string().optional(),
});

export type SeedTransformationFormData = z.infer<typeof seedTransformationSchema>;