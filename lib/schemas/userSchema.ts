import { z } from "zod";

const baseUserSchema = {
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  avatar: z.instanceof(File).optional().nullable(),
};

export const createUserSchema = z.object({
  ...baseUserSchema,
  password: z
    .string()
    .min(6, "Senha mínima de 6 caracteres"),
});

export const updateUserSchema = z.object({
  ...baseUserSchema,
  password: z
    .string()
    .min(6, "Senha mínima de 6 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

