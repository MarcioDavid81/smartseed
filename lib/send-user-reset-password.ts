import UserResetPasswordEmail from "@/components/emails/user-reset-password-email";
import { resend } from "@/lib/resend";

interface SendUserResetPasswordEmailProps {
  name: string;
  email: string;
  resetUrl: string;
}

export async function sendUserResetPasswordEmail({
  name,
  email,
  resetUrl,
}: SendUserResetPasswordEmailProps) {
  try {
    await resend.emails.send({
      from: "SmartSeed <noreply@smartseed.app.br>",
      to: [email],
      subject: "Redefinição de senha no SmartSeed",
      react: UserResetPasswordEmail({
        name,
        resetUrl,
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição de senha:", error);
  }
}