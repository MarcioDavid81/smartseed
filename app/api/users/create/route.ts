import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password, companyId } = await req.json();
  if (!name || !email || !password || !companyId) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  try {
    // Verificar se a empresa existe
    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário já existe
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    // Criar o usuário
    const hashedPassword = await hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId, // Vincula o usuário à empresa
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno ao criar o usuário" }, { status: 500 });
  }
}
