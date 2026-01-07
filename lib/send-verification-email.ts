import UserVerificationEmail from "@/components/emails/user-verification-email";
import { resend } from "@/lib/resend";

interface SendUserVerificationEmailProps {
  name: string;
  email: string;
  verifyUrl: string;
}

export async function sendUserVerificationEmail({
  name,
  email,
  verifyUrl,
}: SendUserVerificationEmailProps) {
  try {
    await resend.emails.send({
      from: "SmartSeed <noreply@smartseed.app.br>",
      to: [email],
      subject: "Confirme seu e-mail no SmartSeed",
      react: UserVerificationEmail({
        name,
        verifyUrl,
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de verificação:", error);
  }
}
