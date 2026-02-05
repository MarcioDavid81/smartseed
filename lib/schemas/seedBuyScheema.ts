import { PaymentCondition } from "@prisma/client";
import { z } from "zod";

export const seedBuySchema = z.object({
  date: z.coerce.date(),
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  invoice: z.string().min(1, "Nota fiscal é obrigatória"),
  unityPrice: z.coerce.number().min(0.01, "Preço unitário é obrigatório"),
  totalPrice: z.coerce.number().min(0.01, "Preço total é obrigatório"),
  customerId: z.string().min(1, "Selecione um cliente"),
  notes: z.string().optional(),
  paymentCondition: z.nativeEnum(PaymentCondition).optional(),
  dueDate: z.coerce.date(),
  purchaseOrderItemId: z.string().optional(),
  cycleId: z.string().optional(),
})

export type BuyFormData = z.infer<typeof seedBuySchema>;
