import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { machineSchema } from "@/lib/schemas/machineSchema";
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
    const body = await req.json();

    const parsed = machineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const machine = await db.machine.create({
      data: {
        ...data,
        companyId,
      },
    });
    
    return NextResponse.json(machine, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar máquina:", error);
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
    const machines = await db.machine.findMany({
      where: {
        companyId,
      },
      include: {
        maintenances: true,
        refuels: true,
      }
    });

    return NextResponse.json(machines);
  } catch (error) {
    console.error("Erro ao buscar máquinas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}