import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  adress: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  phone: z.string().min(14, "Telefone inválido"),
  cpf_cnpj: z
    .string()
    .min(14, "CPF/CNPJ inválido")
    .refine(
      (val) =>
        val.replace(/\D/g, "").length === 14 ||
        val.replace(/\D/g, "").length === 11,
      "CPF ou CNPJ inválido",
    ),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
