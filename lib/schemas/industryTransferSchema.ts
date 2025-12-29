import { ProductType } from "@prisma/client";
import z from "zod";

export const createIndustryTransferSchema = z.object({
  date: z.coerce.date(),
  product: z.nativeEnum(ProductType),
  fromDepositId: z.string().cuid(),
  toDepositId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  document: z.string().optional(),
  observation: z.string().optional(),
});

export type CreateIndustryTransferFormData = z.infer<typeof createIndustryTransferSchema>;