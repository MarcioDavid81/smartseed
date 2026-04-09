import z from "zod";

export const memberAdressSchema = z.object({
  stateRegistration: z.string().optional(),
  zip: z.string().min(1, "CEP é obrigatório"),
  adress: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatório"),
});
 
export type MemberAdressFormData = z.infer<typeof memberAdressSchema>;

export const memberSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional(),
    cpf: z.string().min(11, "CPF é obrigatório").optional(),
    adresses: z.array(memberAdressSchema),
  })
  .superRefine((value, ctx) => {
    if (!value.adresses?.length) return;

    if (value.adresses.length > 1) {
      value.adresses.forEach((addr, index) => {
        if (!addr.stateRegistration || !addr.stateRegistration.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["adresses", index, "stateRegistration"],
            message:
              "Inscrição estadual é obrigatória quando houver mais de um endereço",
          });
        }
      });
    }

    const seen = new Set<string>();
    value.adresses.forEach((addr, index) => {
      const sr = addr.stateRegistration?.trim();
      if (!sr) return;
      const key = sr.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["adresses", index, "stateRegistration"],
          message: "Inscrição estadual duplicada",
        });
      } else {
        seen.add(key);
      }
    });
  });

export type MemberFormData = z.infer<typeof memberSchema>;