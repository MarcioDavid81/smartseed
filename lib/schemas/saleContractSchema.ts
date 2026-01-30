import { ProductType, SaleContractType, Unit } from "@prisma/client";
import { z } from "zod";

export const saleContractItemSchema = z.object({
  id: z.string().optional(),
  product: z.nativeEnum(ProductType).optional(),
  cultivarId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.0001, "Quantidade é obrigatória"),
  unit: z.nativeEnum(Unit),
  unityPrice: z.coerce.number().min(0.0001, "Preço unitário é obrigatório"),
  totalPrice: z.coerce.number().min(0.01, "Preço total é obrigatório"),
})

export const saleContractSchema = z.object({
  type: z.nativeEnum(SaleContractType),
  date: z.coerce.date(),
  document: z.string().optional(),
  customerId: z.string(),
  notes: z.string().optional(),
  items: z.array(saleContractItemSchema).min(1, "Adicione ao menos um item"),
});

export type SaleContractFormData = z.infer<typeof saleContractSchema>;