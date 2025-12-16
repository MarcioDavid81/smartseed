import z from "zod";

export const refuelSchema = z.object({
  date: z.coerce.date(),
  quantity: z.coerce.number().min(1, "Quantidade é obrigatória"),
  tankId: z.string().min(1, "Tanque é obrigatório"),
  machineId: z.string().min(1, "Máquina é obrigatória"),
  hourmeter: z.coerce.number().positive().optional(),
  odometer: z.coerce.number().positive().optional(),
})

export type RefuelFormData = z.infer<typeof refuelSchema>;