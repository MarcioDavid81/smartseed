import { MachineType } from "@prisma/client";
import { z } from "zod";

export const machineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome da máquina é obrigatório"),
  type: z.nativeEnum(MachineType),
  brand: z.string().optional(),
  model: z.string().optional(),
  plate: z.string().optional(),
  serialNumber: z.string().optional(),
  houmeter: z.number().optional(),
  odometer: z.number().optional(),
});

export type MachineFormData = z.infer<typeof machineSchema>;