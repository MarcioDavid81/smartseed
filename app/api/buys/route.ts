import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const { cultivarId, supplier, date, quantityKg, notes } = await req.json();

    if (!cultivarId || !supplier || !date || !quantityKg) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const buys = await db.buy.create({
      data: {
        cultivarId,
        supplier,
        date: new Date(date),
        quantityKg,
        notes,
        companyId,
      },
    });
    console.log("Atualizando estoque da cultivar:", cultivarId);
    // Atualiza o estoque da cultivar
    await db.cultivar.update({
      where: { id: cultivarId },
      data: {
        stock: {
          increment: quantityKg,
        },
      },
    });

    return NextResponse.json(buys, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar compra:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const buys = await db.buy.findMany({
      where: { companyId },
      include: {
        cultivar: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(buys, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
