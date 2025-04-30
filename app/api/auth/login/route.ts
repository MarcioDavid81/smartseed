import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { db } from "@/lib/prisma"; // Certifique-se de que o prisma está configurado
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  try {
    // Verificar se o usuário existe
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Comparar a senha fornecida com a armazenada
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // Gerar token JWT
    const token = sign(
      { userId: user.id, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: "7d" } // Token válido por 7 dias
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
