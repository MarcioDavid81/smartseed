import { z } from "zod";

export const farmSchema = z.object({
  name: z.string().trim().min(1, "Nome da fazenda é obrigatório!")
})

export type FarmFormData = z.infer<typeof farmSchema>
