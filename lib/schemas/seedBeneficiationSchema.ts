import z from "zod";

export const beneficiationSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  date: z.coerce.date(),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  destinationId: z.string().min(1, "Selecione um depósito"),
  notes: z.string(),
});

export type BeneficiationFormData = z.infer<typeof beneficiationSchema>;
