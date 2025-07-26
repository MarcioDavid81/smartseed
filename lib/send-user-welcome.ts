import UserWelcomeEmail from "@/components/emails/user-welcome-email";
import { resend } from "@/lib/resend";

interface SendUserWelcomeEmailProps {
  name: string;
  email: string;
  companyName: string;
}

export async function sendUserWelcomeEmail({
  name,
  email,
  companyName,
}: SendUserWelcomeEmailProps) {
  try {
    await resend.emails.send({
      from: "SmartSeed <noreply@smartseed.app.br>",
      to: [email],
      subject: "Bem-vindo ao SmartSeed",
      react: UserWelcomeEmail({ name, email, companyName }),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de boas-vindas:", error);
  }
}
