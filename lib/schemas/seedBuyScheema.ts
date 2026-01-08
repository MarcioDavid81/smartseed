import { PaymentCondition } from "@prisma/client";
import { z } from "zod";

export const seedBuySchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  customerId: z.string().min(1, "Selecione um cliente"),
  date: z.coerce.date(),
  invoice: z.string().min(1, "Nota fiscal é obrigatória"),
  unityPrice: z.coerce.number().min(0.01, "Preço unitário é obrigatório"),
  totalPrice: z.coerce.number().min(0.01, "Preço total é obrigatório"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  paymentCondition: z.nativeEnum(PaymentCondition).optional(),
  dueDate: z.coerce.date(),
  notes: z.string().optional(),
  cycleId: z.string().optional(),
})

export type BuyFormData = z.infer<typeof seedBuySchema>;
