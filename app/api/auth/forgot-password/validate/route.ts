export const dynamic = "force-dynamic";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          message: "Token inválido",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * hash do token recebido
     */
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    /**
     * busca token válido
     */
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

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

    return NextResponse.json(
      {
        valid: true,
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
