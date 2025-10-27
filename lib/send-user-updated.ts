import UserUpdatedEmail from "@/components/emails/user-updated-email";
import { resend } from "@/lib/resend";

interface SendUserUpdatedEmailProps {
  name: string;
  email: string;
  password: string;
}

export async function sendUserUpdatedEmail({
  name,
  email,
  password,
}: SendUserUpdatedEmailProps) {
  try {
    await resend.emails.send({
      from: "SmartSeed <noreply@smartseed.app.br>",
      to: [email],
      subject: "Atualização de credenciais no SmartSeed",
      react: UserUpdatedEmail({ name, email, password }),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de atualização:", error); 
  }
}
