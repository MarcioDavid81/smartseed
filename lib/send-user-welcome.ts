import UserWelcomeEmail from '@/components/emails/user-welcome-email'
import { resend } from '@/lib/resend'

export async function sendUserWelcomeEmail({
  name,
  email,
  companyName,
}: {
  name: string
  email: string
  companyName: string
}) {
  try {
    await resend.emails.send({
      from: 'SmartSeed <onboarding@resend.dev>',
      to: [email],
      subject: 'Bem-vindo ao SmartSeed',
      react: UserWelcomeEmail({ name, email, companyName }),
    })
  } catch (error) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error)
  }
}
