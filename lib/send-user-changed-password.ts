import UserChangedPasswordEmail from "@/components/emails/user-changed-password-email";
import { resend } from "@/lib/resend";

interface SendUserChangedPasswordEmailProps {
  name: string;
  email: string;
}

export async function sendUserChangedPasswordEmail({
  name,
  email,
}: SendUserChangedPasswordEmailProps) {
  try {
    await resend.emails.send({
      from: "SmartSeed <noreply@smartseed.app.br>",
      to: [email],
      subject: "Sucesso",
      react: UserChangedPasswordEmail({
        name,
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de mudança de senha:", error);
  }
}