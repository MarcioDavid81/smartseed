export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token não informado" },
        { status: 400 }
      );
    }

    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 404 }
      );
    }

    // ⏱️ token expirado
    if (verificationToken.expiresAt < new Date()) {
      await db.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: "Token expirado" },
        { status: 410 }
      );
    }

    // ✅ marca usuário como verificado
    await db.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    // 🧹 remove token após uso
    await db.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
