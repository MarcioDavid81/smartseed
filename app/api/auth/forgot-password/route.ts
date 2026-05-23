export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/tokens/generate-password-reset-token"
import { sendUserResetPasswordEmail } from "@/lib/send-user-reset-password"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email?.trim().toLowerCase()
    if (!email) {
      return NextResponse.json(
        {
          message: "Email é obrigatório",
        },
        {
          status: 400,
        },
      )
    }

    const user = await db.user.findUnique({
      where: {
        email,
      },
    })

    /**
     * IMPORTANTE:
     * nunca revelar se o email existe ou não
     */
    if (!user) {
      return NextResponse.json(
        {
          message:
            "Se existir uma conta com este email, enviaremos instruções de recuperação.",
        },
        {
          status: 200,
        },
      )
    }

    /**
     * Opcional:
     * impedir reset para emails não verificados
     */
    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        {
          message:
            "Se existir uma conta com este email, enviaremos instruções de recuperação.",
        },
        {
          status: 200,
        },
      )
    }

    /**
     * invalida tokens antigos
     */
    await db.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    })

    /**
     * gera token
     */
    const { rawToken, hashedToken } =
      generatePasswordResetToken()

    /**
     * expira em 1 hora
     */
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60)

    /**
     * salva token
     */
    await db.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    })

    /**
     * link recuperação
     */
    const resetLink =
      `${process.env.APP_URL}/reset-password?token=${rawToken}`

    await sendUserResetPasswordEmail({
      name: user.name,
      email,
      resetUrl: resetLink,
    })

    return NextResponse.json(
      {
        message:
          "Se existir uma conta com este email, enviaremos instruções de recuperação.",
      },
      {
        status: 200,
      },
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
      },
      {
        status: 500,
      },
    )
  }
}