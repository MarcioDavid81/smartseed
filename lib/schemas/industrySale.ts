import { PaymentCondition } from "@prisma/client";
import z from "zod";

export const industrySaleSchema = z.object({
  date: z.coerce.date(),
  document: z.string().optional(),
  industryDepositId: z
    .string()
    .min(1, "Depósito de destino da venda é obrigatório"),
  customerId: z.string().min(1, "Cliente é obrigatório"),
  industryTransporterId: z.string().optional(),
  truckPlate: z.string().optional(),
  truckDriver: z.string().optional(),
  weightBt: z.coerce.number().min(1, "Peso bruto é obrigatório"),
  weightTr: z.coerce.number().min(1, "Peso da tara é obrigatório"),
  weightSubLiq: z.coerce.number().min(1, "Peso sub-líquido é obrigatório"),
  discountsKg: z.coerce.number().optional(),
  weightLiq: z.coerce.number().min(1, "Peso líquido é obrigatório"),
  unitPrice: z.coerce.number().min(0.01, "Preço unitário é obrigatório"),
  totalPrice: z.coerce.number().min(1, "Preço total é obrigatório"),
  notes: z.string().optional(),
  paymentCondition: z.nativeEnum(PaymentCondition).optional(),
  dueDate: z.coerce.date().optional(),
  cycleId: z.string().optional(),
});

export type IndustrySaleFormData = z.infer<typeof industrySaleSchema>;