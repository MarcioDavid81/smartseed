import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha mínima de 6 caracteres"),
  avatar: z.instanceof(File).nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
