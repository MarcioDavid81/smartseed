import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, Plan } from "@prisma/client";
import { generateEmailVerificationToken } from "@/lib/auth/generate-email-verification-token";
import { sendUserVerificationEmail } from "@/lib/send-verification-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      company,
      user,
    }: {
      company: { name: string };
      user: { name: string; email: string; password: string };
    } = body;

    if (
      !company?.name ||
      !user?.name ||
      !user?.email ||
      !user?.password
    ) {
      return NextResponse.json(
        { message: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    const emailExists = await db.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (emailExists) {
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    // 🧠 transaction apenas para persistência
    const createdUser = await db.$transaction(async (tx) => {
      const companyCreated = await tx.company.create({
        data: {
          name: company.name,
          plan: Plan.BASIC,
        },
      });

      return tx.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: Role.ADMIN,
          companyId: companyCreated.id,
        },
      });
    });

    // 🔐 gera token de verificação
    const token = await generateEmailVerificationToken({
      userId: createdUser.id,
    });

    // 🌍 monta URL
    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    // 📧 envia e-mail
    await sendUserVerificationEmail({
      name: createdUser.name,
      email: createdUser.email,
      verifyUrl,
    });

    // ✅ resposta limpa para o front
    return NextResponse.json(
      {
        message:
          "Cadastro realizado com sucesso. Verifique seu e-mail para ativar sua conta.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);

    return NextResponse.json(
      { message: "Erro interno ao realizar onboarding" },
      { status: 500 }
    );
  }
}
