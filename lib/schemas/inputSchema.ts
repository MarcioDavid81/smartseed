import { PaymentCondition, ProductClass, Unit } from "@prisma/client";
import { z } from "zod";

export const inputProductSchema = z.object({
  name: z.string().min(1, "Nome do insumo é obrigatório"),
  description: z.string().max(500).optional(),
  class: z.nativeEnum(ProductClass),
  unit: z.nativeEnum(Unit),
})

export type InputProductFormData = z.infer<typeof inputProductSchema>;

export const inputPurchaseSchema = z.object({
  date: z.coerce.date(),
  productId: z.string(),
  quantity: z.coerce.number().min(1, "Quantidade inválida"),
  invoiceNumber: z.string().min(1, "Número da fatura é obrigatório"),
  unitPrice: z.coerce.number().min(0.01, "Preço unitário é obrigatório"),
  totalPrice: z.coerce.number().min(0.01, "Preço total é obrigatório"),
  customerId: z.string(),
  notes: z.string().optional(),
  farmId: z.string(),
  paymentCondition: z.nativeEnum(PaymentCondition).optional(),
  dueDate: z.coerce.date().optional(),
  purchaseOrderItemId: z.string().optional(),
})

export type InputPurchaseFormData = z.infer<typeof inputPurchaseSchema>;

export const inputTransferSchema = z.object({
  date: z.coerce.date(),
  productId: z.string(),
  quantity: z.coerce.number().positive("Quantidade inválida"),
  originFarmId: z.string(),
  destFarmId: z.string(),
})

export type InputTransferFormData = z.infer<typeof inputTransferSchema>;

export const inputApplicationSchema = z.object({
  date: z.coerce.date(),
  productStockId: z.string(),
  quantity: z.coerce.number().positive("Quantidade inválida"),
  talhaoId: z.string(),
  notes: z.string().optional(),
  cycleId: z.string().optional(),
})

export type InputApplicationFormData = z.infer<typeof inputApplicationSchema>;