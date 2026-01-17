"use server";

import { sendContactEmail } from "@/lib/send-contact-email";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function sendContactAction(data: unknown) {
  const parsed = contactSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  try {
    await sendContactEmail(parsed.data);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao enviar email" };
  }
}
