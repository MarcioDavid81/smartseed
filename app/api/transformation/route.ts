import { validateStock } from "@/app/_helpers/validateStock";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { seedTransformationSchema } from "@/lib/schemas/transformation";
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
    const body = await req.json();
    const parsed = seedTransformationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((issue) => issue.message) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const stockValidation = await validateStock(data.cultivarId, data.quantityKg);
    if (stockValidation) return stockValidation;

    const cultivar = await db.cultivar.findUnique({
      where: { id: data.cultivarId },
      select: { id: true, name: true, product: true },
    });

    if (!cultivar) {
      return NextResponse.json(
        { error: "Cultivar não encontrada" },
        { status: 404 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Cria o registro da transformação
      const transformation = await tx.transformation.create({
        data: {
          date: new Date(data.date),
          cultivarId: data.cultivarId,
          quantityKg: data.quantityKg,
          destinationId: data.destinationId,
          notes: data.notes,
          companyId,
        },
      });
      
      // 2️⃣ Atualiza o estoque da cultivar (decrementa)
      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: {
            decrement: data.quantityKg,
          },
        },
      });

      // 3️⃣ Incrementa o estoque no depósito industrial, se houver destino
      if (data.destinationId) {
        const existingIndustryStock = await tx.industryStock.findFirst({
          where: {
            companyId,
            product: cultivar.product,
            industryDepositId: data.destinationId,
          },
        });

        if (existingIndustryStock) {
          await tx.industryStock.update({
            where: { id: existingIndustryStock.id },
            data: {
              quantity: { increment: data.quantityKg },
            },
          });
        } else {
          await tx.industryStock.create({
            data: {
              companyId,
              product: cultivar.product,
              industryDepositId: data.destinationId,
              quantity: data.quantityKg,
            },
          });
        }
      }
      
      return transformation;
    })
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transformação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET (req: NextRequest) {
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
    const transformations = await db.transformation.findMany({
      where: { companyId },
      include: {
        cultivar: {
          select: { id: true, name: true, product: true},
        },
        destination: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transformations, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transformações:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
