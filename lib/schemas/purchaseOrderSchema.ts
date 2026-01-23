import { PurchaseOrderType, Unit } from "@prisma/client";
import { z } from "zod";

export const purchaseOrderSchema = z.object({
  type: z.nativeEnum(PurchaseOrderType),
  date: z.coerce.date(),
  document: z.string().optional(),
  customerId: z.string(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      cultivarId: z.string().optional(),
      description: z.string().optional(),
      quantity: z.coerce.number().min(0.0001, "Quantidade é obrigatória"),
      unit: z.nativeEnum(Unit),
      unityPrice: z.coerce.number().min(0.0001, "Preço unitário é obrigatório"),
      totalPrice: z.coerce.number().min(0.01, "Preço total é obrigatório"),
    })
  ).min(1, "Adicione ao menos um item"),
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
