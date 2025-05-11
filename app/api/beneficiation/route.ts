import { validateStock } from "@/app/_helpers/validateStock";
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
    const { cultivarId, date, quantityKg, notes } = await req.json();

    if (!cultivarId || !date || !quantityKg) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const stockValidation = await validateStock(cultivarId, quantityKg);
    if (stockValidation) return stockValidation;

    const beneficiations = await db.beneficiation.create({
      data: {
        cultivarId,
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
          decrement: quantityKg,
        },
      },
    });

    return NextResponse.json(beneficiations, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar descarte:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
    const beneficiations = await db.beneficiation.findMany({
      where: { companyId },
      include: {
        cultivar: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(beneficiations, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar descartes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
