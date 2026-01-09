import { PaymentCondition } from "@prisma/client";
import { z } from "zod";

export const seedSaleSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  customerId: z.string().min(1, "Selecione um talhão"),
  date: z.coerce.date(),
  invoiceNumber: z.string().min(1, "Informe a nota fiscal"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  saleValue: z.coerce.number().min(0.01, "Preço total é obrigatório"),
  notes: z.string().optional(),
  paymentCondition: z.nativeEnum(PaymentCondition),
  dueDate: z.coerce.date(),
  cycleId: z.string().optional(),
});

export type SeedSaleFormData = z.infer<typeof seedSaleSchema>;