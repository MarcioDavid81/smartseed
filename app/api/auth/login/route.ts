// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { db } from "@/lib/prisma";
import { SignJWT } from "jose";

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
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const isValid = await compare(password, user.password);

  if (!isValid) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  // const token = sign({ userId: user.id, companyId: user.companyId }, JWT_SECRET, { expiresIn: "7d" });

  const token = await new SignJWT({ userId: user.id, companyId: user.companyId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());

  const response = NextResponse.json({ message: "Login bem-sucedido", user });

  // 🔐 Grava o token como cookie acessível no middleware
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return response;
}
