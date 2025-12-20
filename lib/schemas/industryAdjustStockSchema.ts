import { ProductType } from "@prisma/client";
import z from "zod";

export const industryAdjustmentSchema = z.object({
  date: z.coerce.date(),
  quantityKg: z.coerce.number(),
  product: z.nativeEnum(ProductType),
  industryDepositId: z.string(),
  direction: z.enum(["entrada", "saida"]),
  notes: z.string().optional(),
})

export type IndustryAdjustStockFormData = z.infer<typeof industryAdjustmentSchema>;
