import { ProductType, SaleContractType, Unit } from "@prisma/client";
import { z } from "zod";

export const saleContractSchema = z.object({
  date: z.coerce.date(),
  document: z.string().optional(),
  customerId: z.string(),
  notes: z.string().optional(),
  companyId: z.string(),
  items: z
    .array(
      z
        .object({
          product: z.nativeEnum(ProductType).optional(),
          cultivarId: z.string().optional(),
          description: z.string().optional(),
          quantity: z.coerce.number().min(0.0001, "Quantidade é obrigatória"),
          unit: z.nativeEnum(Unit),
          unityPrice: z.coerce
            .number()
            .min(0.0001, "Preço unitário é obrigatório"),
          type: z.nativeEnum(SaleContractType),
        })
        .superRefine((data, ctx) => {
          if (data.type === SaleContractType.SEED_SALE && !data.cultivarId) {
            ctx.addIssue({
              path: ["cultivarId"],
              message: "Cultivar é obrigatório para venda de sementes",
              code: z.ZodIssueCode.custom,
            });
          }

          if (data.type === SaleContractType.INDUSTRY_SALE && !data.product) {
            ctx.addIssue({
              path: ["product"],
              message: "Produto é obrigatório para venda indústria",
              code: z.ZodIssueCode.custom,
            });
          }

          if (data.type === SaleContractType.SEED_SALE && data.product) {
            ctx.addIssue({
              path: ["product"],
              message: "Produto não deve ser informado em venda de sementes",
              code: z.ZodIssueCode.custom,
            });
          }

          if (data.type === SaleContractType.INDUSTRY_SALE && data.cultivarId) {
            ctx.addIssue({
              path: ["cultivarId"],
              message: "Cultivar não deve ser informado em venda indústria",
              code: z.ZodIssueCode.custom,
            });
          }
        }),
    )
    .min(1, "Adicione ao menos um item"),
});

export type SaleContractFormData = z.infer<typeof saleContractSchema>;
