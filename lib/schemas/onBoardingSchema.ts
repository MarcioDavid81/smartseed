import { z } from "zod";

export const onboardingSchema = z.object({
  company: z.object({
    name: z
      .string()
      .min(2, "Nome da empresa é obrigatório"),
  }),
  user: z.object({
    name: z
      .string()
      .min(2, "Nome do usuário é obrigatório"),
    email: z
      .string()
      .email("E-mail inválido"),
    password: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
  }),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
