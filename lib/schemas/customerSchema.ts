import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  adress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  cpf_cnpj: z
    .string()
    .optional()
    .refine(
      (val) =>
        val?.replace(/\D/g, "").length === 14 ||
        val?.replace(/\D/g, "").length === 11,
      "CPF ou CNPJ inválido",
    ),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
