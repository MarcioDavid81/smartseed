import z from "zod";

export const plotSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  area: z.number().min(1, "Área do talhão é obrigatória"),
  farmId: z.string().min(1, "Fazenda é obrigatória"), 
});

export type PlotFormData = z.infer<typeof plotSchema>;