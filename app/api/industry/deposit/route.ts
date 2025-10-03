import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Nome do depósito é obrigatório" }, { status: 400 });
    }

    const industryDeposit = await db.industryDeposit.create({
      data: {
        name,
        companyId,
      },
    });

    return NextResponse.json(industryDeposit, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar depósito:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET (req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const industryDeposits = await db.industryDeposit.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(industryDeposits, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}