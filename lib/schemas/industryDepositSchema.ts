import z from "zod";

export const industryDepositSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export type IndustryDepositFormData = z.infer<typeof industryDepositSchema>;