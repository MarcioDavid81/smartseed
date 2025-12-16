import { PaymentCondition } from "@prisma/client";
import z from "zod";

export const maintenanceSchema = z.object({
  date: z.coerce.date(),
  machineId: z.string().min(1, "Máquina é obrigatória"),
  customerId: z.string().min(1, "Cliente é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  totalValue: z.coerce.number().positive(),
  paymentCondition: z.nativeEnum(PaymentCondition).optional(),
  dueDate: z.coerce.date().optional(),
})

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
