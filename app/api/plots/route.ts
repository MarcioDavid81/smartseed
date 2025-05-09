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

  const { companyId } = payload;

  try {
    const { name, area, farmId } = await req.json();

    if (!name || !area || !farmId) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const plot = await db.talhao.create({
      data: {
        name,
        area,
        farmId,
        companyId,
      },
    });

    return NextResponse.json(plot, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar talhão:", error);
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
      const plots = await db.talhao.findMany({
        where: { companyId },
        include: { farm: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      });
  
      return NextResponse.json(plots, { status: 200 });
    } catch (error) {
      console.error("Erro ao buscar talhões:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  }
