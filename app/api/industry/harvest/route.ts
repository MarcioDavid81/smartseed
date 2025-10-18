import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { industryHarvestSchema } from "@/lib/schemas/industryHarvest"; // ⚠️ vamos remover o product daqui
import { ProductType } from "@prisma/client";

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

    // ✅ product não vem mais do front
    const parsed = industryHarvestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // 🧠 Busca o produto do ciclo
    const cycle = await db.productionCycle.findFirst({
      where: {
        id: data.cycleId,
        companyId, // segurança extra
      },
      select: {
        productType: true,
      },
    });

    if (!cycle) {
      return NextResponse.json(
        { error: "Ciclo não encontrado ou não pertence à empresa" },
        { status: 404 },
      );
    }

    // 🚀 Cria a colheita com o produto vindo do ciclo
    const industryHarvest = await db.industryHarvest.create({
      data: {
        ...data,
        date: new Date(data.date),
        companyId,
        product: cycle.productType as ProductType, // 🔥 injeta aqui
      },
    });

    // 📦 Atualiza ou cria estoque
    await db.industryStock.upsert({
      where: {
        product_industryDepositId: {
          product: cycle.productType as ProductType, // usa o produto do ciclo
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
        product: cycle.productType as ProductType, // usa o produto do ciclo
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

  const { searchParams } = new URL(req.url);
  const depositId = searchParams.get("depositId");
  const product = searchParams.get("product");
  const cycleId = searchParams.get("cycleId");

  try {
    const industryHarvests = await db.industryHarvest.findMany({
      where: {
        companyId: payload.companyId,
        ...(depositId ? { industryDepositId: depositId } : {}),
        ...(product ? { product: product as ProductType } : {}),
        ...(cycleId ? { cycleId } : {}),
      },
      include: {
        industryDeposit: true,
        industryTransporter:{
          select: {
            name: true,
          }
        },
        talhao: {
          select: {
            name: true,
            farm: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { document: "asc" },
    });

    return NextResponse.json(industryHarvests);
  } catch (error) {
    console.error("Erro ao buscar colheitas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
