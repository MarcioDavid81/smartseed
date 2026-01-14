import { z } from "zod";

export const rainSchema = z.object({
  date: z.coerce.date(),
  farmId: z.string(),
  quantity: z.coerce.number().min(1, "Quantidade é obrigatória"),
})

export type RainFormData = z.infer<typeof rainSchema>;