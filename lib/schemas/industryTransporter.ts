import z from "zod";

export const industryTransporterSchema = z.object({
  name: z.string().min(1, "Nome do transportador é obrigatório"),
  fantasyName: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  adress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
});

export type IndustryTransporterFormData = z.infer<typeof industryTransporterSchema>;