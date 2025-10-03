import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { industryTransporterSchema } from "@/lib/schemas/industryTransporter";

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
    const body = await req.json();

    const parsed = industryTransporterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const industryTransporter = await db.industryTransporter.create({
      data: {
        ...data,
        companyId,
      },
    });

    return NextResponse.json(industryTransporter, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transportador:", error);
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
    const industryTransporters = await db.industryTransporter.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(industryTransporters, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transportadores:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}