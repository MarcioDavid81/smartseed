import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/prisma";
import { SignJWT } from "jose";
import { downgradeCompanyPlanIfExpired } from "@/core/plans/downgrade-company-plan-if-expired";

const JWT_SECRET = process.env.JWT_SECRET!;

function getJwtSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await db.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      {
        error:
          "E-mail ainda não confirmado. Verifique sua caixa de entrada para ativar sua conta.",
      },
      { status: 403 },
    );
  }

  const isValid = await compare(password, user.password);

  if (!isValid) {
    return NextResponse.json(
      { error: "Dados inválidos, tente novamente." },
      { status: 401 },
    );
  }

  // Valida o plano do usuário antes de gerar o token e em caso de TRIAL expirado, faz downgrade para BASIC
  const company = await downgradeCompanyPlanIfExpired(user.companyId);

  // Calcular dias restantes até o fim do período TRIAL
  let trialDaysRemaining: number | null = null;

  if (company.plan === "TRIAL" && company.planExpiresAt) {
    const now = new Date();
    const diffMs = company.planExpiresAt.getTime() - now.getTime();
    trialDaysRemaining = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
  }

  // 🔐 Gera o token JWT com os dados do usuário
  const token = await new SignJWT({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
    sub: company.plan || "BASIC",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());

  const response = NextResponse.json({
    message: "Login bem-sucedido",
    token,
    user,
    company: {
      plan: company.plan,
      trialDaysRemaining,
    },
  });

  // 🔐 Grava o token como cookie acessível no middleware
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return response;
}
