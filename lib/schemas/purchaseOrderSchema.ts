import { PurchaseOrderType, Unit } from "@prisma/client";
import { z } from "zod";

export const purchaseOrderSchema = z.object({
  date: z.date(),
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
      type: z.nativeEnum(PurchaseOrderType),
    }).superRefine((data, ctx) => {
      if (data.type === PurchaseOrderType.SEED_PURCHASE && !data.cultivarId) {
        ctx.addIssue({
          path: ["cultivarId"],
          message: "Cultivar é obrigatório para compra de sementes",
          code: z.ZodIssueCode.custom,
        });
      }
      if (data.type === PurchaseOrderType.INPUT_PURCHASE && !data.productId) {
        ctx.addIssue({
          path: ["productId"],
          message: "Produto é obrigatório para compra de insumos",
          code: z.ZodIssueCode.custom,
        });
      }
      if (data.type === PurchaseOrderType.SEED_PURCHASE && data.productId) {
        ctx.addIssue({
          path: ["productId"],
          message: "Produto não deve ser informado em compra de sementes",
          code: z.ZodIssueCode.custom,
        });
      }
      if (data.type === PurchaseOrderType.INPUT_PURCHASE && data.cultivarId) {
        ctx.addIssue({
          path: ["cultivarId"],
          message: "Cultivar não deve ser informado em compra de insumos",
          code: z.ZodIssueCode.custom,
        });
      }
    })
  ).min(1, "Adicione ao menos um item"),
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
