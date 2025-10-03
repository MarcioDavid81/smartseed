import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { industryHarvestSchema } from "@/lib/schemas/industryHarvest";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const body = await req.json();

    const parsed = industryHarvestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const industryHarvest = await db.industryHarvest.create({
      data: {
        ...data,
        companyId,
      },
    });

    //se não existir o estoque, criar um novo, se existir, incrementar a quantidade
    await db.industryStock.upsert({
      where: {
        industryProductId_industryDepositId: {
          industryProductId: data.productId,
          industryDepositId: data.industryDepositId,
        },
      },
      update: {
        quantity: {
          increment: data.weightLiq,
        },
      },
      create: {
        companyId,
        industryProductId: data.productId,
        industryDepositId: data.industryDepositId,
        quantity: data.weightLiq,
      },
    });

    return NextResponse.json(industryHarvest, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colheita:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const industryHarvests = await db.industryHarvest.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(industryHarvests, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar colheitas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
