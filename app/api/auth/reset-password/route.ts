import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendUserChangedPasswordEmail } from "@/lib/send-user-changed-password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = body.token;
    const password = body.password;

    if (!token || !password) {
      return NextResponse.json(
        {
          message: "Token e senha são obrigatórios",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * hash do token recebido
     */
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    /**
     * busca token válido
     */
    const passwordResetToken =
      await db.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },

        include: {
          user: true,
        },
      });

    /**
     * token inválido
     */
    if (!passwordResetToken) {
      return NextResponse.json(
        {
          message: "Token inválido ou expirado",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * hash da nova senha
     */
    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    /**
     * atualiza senha usuário
     */
    await db.user.update({
      where: {
        id: passwordResetToken.userId,
      },

      data: {
        password: hashedPassword,
      },
    });

    /**
     * envia e-mail de sucesso
     */
    await sendUserChangedPasswordEmail({
      name: passwordResetToken.user.name,
      email: passwordResetToken.user.email,
    });

    /**
     * invalida TODOS tokens do usuário
     */
    await db.passwordResetToken.updateMany({
      where: {
        userId: passwordResetToken.userId,
        usedAt: null,
      },

      data: {
        usedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Senha redefinida com sucesso",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
      },
      {
        status: 500,
      },
    );
  }
}