import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const industryHarvestSchema = z.object({
  date: z.string().min(1, "Data da colheita é obrigatória"),
  document: z.string().optional(),
  productId: z.string().min(1, "Produto da colheita é obrigatório"),
  talhaoId: z.string().min(1, "Talhão da colheita é obrigatório"),
  industryDepositId: z
    .string()
    .min(1, "Depósito de destino da colheita é obrigatório"),
  industryTransporterId: z.string().optional(),
  truckPlate: z.string().optional(),
  truckDriver: z.string().optional(),
  weightBt: z.number().min(1, "Peso bruto é obrigatório"),
  weightTr: z.number().min(1, "Peso da tara é obrigatório"),
  weightSubLiq: z.number().min(1, "Peso sub-líquido é obrigatório"),
  humidity_percent: z.number().min(1, "Porcentagem de umidade é obrigatória"),
  humidity_discount: z.number().min(0, "Desconto da umidade é obrigatório"),
  humidity_kg: z.number().min(1, "Peso da umidade é obrigatório"),
  impurities_percent: z
    .number()
    .min(1, "Porcentagem de impurezas é obrigatória"),
  impurities_discount: z
    .number()
    .min(0, "Desconto das impurezas é obrigatório"),
  impurities_kg: z.number().min(1, "Peso das impurezas é obrigatório"),
  weightLiq: z.number().min(1, "Peso líquido é obrigatório"),
  cycleId: z.string().min(1, "Ciclo da colheita é obrigatório"),
});

export type IndustryHarvest = z.infer<typeof industryHarvestSchema>;

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
