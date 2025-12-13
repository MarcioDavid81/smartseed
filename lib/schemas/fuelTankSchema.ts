import z from "zod";

export const fuelTankSchema = z.object({
  name: z.string().min(1, "Nome do tanque de combustível é obrigatório"),
  capacity: z.number().min(1, "Capacidade do tanque de combustível é obrigatória"),
});

export type FuelTankFormData = z.infer<typeof fuelTankSchema>;