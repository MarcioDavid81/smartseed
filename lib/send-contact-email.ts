import ContactEmail from "@/components/emails/contact-email";
import { resend } from "@/lib/resend";

interface SendContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail({
  name,
  email,
  message,
}: SendContactEmailProps) {
  await resend.emails.send({
    from: "SmartSeed <noreply@smartseed.app.br>",
    to: ["md.webdeweloper@gmail.com"], // email interno
    replyTo: email,
    subject: "Novo contato via site",
    react: ContactEmail({ name, email, message }),
  });
}
