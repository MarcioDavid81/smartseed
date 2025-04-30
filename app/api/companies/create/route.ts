import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // Certifique-se de que o prisma está configurado

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Campo 'name' é obrigatório" }, { status: 400 });
  }

  try {
    // Criar a empresa
    const company = await db.company.create({
      data: {
        name, // Nome da empresa
      },
    });

    return NextResponse.json({ success: true, companyId: company.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno ao criar a empresa" }, { status: 500 });
  }
}
