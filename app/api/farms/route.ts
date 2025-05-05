import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { userId, companyId } = payload;

  try {
    const { name, area } = await req.json();

    if (!name || !area) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const farm = await db.farm.create({
      data: {
        name,
        area,
        companyId,
      },
    });

    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fazenda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
    const farms = await db.farm.findMany({
      where: { companyId },
      include: { talhoes: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(farms, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar fazendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
