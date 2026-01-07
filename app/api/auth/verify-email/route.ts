export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/login?error=invalid-token`
      );
    }

    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/login?error=token-not-found`
      );
    }

    // ⏱️ token expirado
    if (verificationToken.expiresAt < new Date()) {
      // limpa token expirado
      await db.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(
        `${process.env.APP_URL}/login?error=token-expired`
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

    return NextResponse.redirect(
      `${process.env.APP_URL}/login?verified=true`
    );
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]", error);

    return NextResponse.redirect(
      `${process.env.APP_URL}/login?error=internal`
    );
  }
}
