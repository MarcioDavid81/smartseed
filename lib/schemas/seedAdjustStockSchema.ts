import z from "zod";

export const seedAdjustmentSchema = z.object({
  date: z.coerce.date(),
  quantityKg: z.coerce.number(),
  cultivarId: z.string(),
  notes: z.string().optional(),
});

export type SeedAdjustStock = z.infer<typeof seedAdjustmentSchema>;
