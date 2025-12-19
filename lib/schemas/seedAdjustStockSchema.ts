import z from "zod";

export const seedAdjustmentSchema = z.object({
  date: z.coerce.date(),
  cultivarId: z.string(),
  quantityKg: z.coerce.number(),
  direction: z.enum(["entrada", "saida"]),
  notes: z.string().optional(),
});

export type SeedAdjustStock = z.infer<typeof seedAdjustmentSchema>;
