import { PaymentCondition } from "@prisma/client";
import z from "zod";

export const fuelPurchaseSchema = z.object({
  date: z.coerce.date(),
  invoiceNumber: z.string().min(1, "Número da fatura é obrigatório"),
  fileUrl: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantidade é obrigatória"),
  unitPrice: z.coerce.number().min(0.01, "Preço unitário é obrigatório"),
  totalValue: z.coerce.number().min(1, "Preço total é obrigatório"),
  customerId: z.string().min(1, "Cliente é obrigatório"),
  tankId: z.string().min(1, "Tanque é obrigatório"),
  paymentCondition: z.nativeEnum(PaymentCondition).optional(),
  dueDate: z.coerce.date().optional(),
})

export type FuelPurchaseFormData = z.infer<typeof fuelPurchaseSchema>;