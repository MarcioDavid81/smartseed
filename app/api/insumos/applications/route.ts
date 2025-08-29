import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createApplicationSchema = z.object({
  productStockId: z.string().cuid(),
  quantity: z.number().positive(),
  talhaoId: z.string().cuid(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  companyId: z.string().uuid(),
  cycleId: z.string().cuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createApplicationSchema.parse(body);

    // pega o estoque
    const stock = await db.productStock.findUnique({
      where: { id: data.productStockId },
    });

    if (!stock) {
      return NextResponse.json(
        { error: "Estoque não encontrado para este insumo." },
        { status: 404 }
      );
    }

    if (stock.stock < data.quantity) {
      return NextResponse.json(
        {
          error: `Estoque insuficiente. Disponível: ${stock.stock}, solicitado: ${data.quantity}.`,
        },
        { status: 400 }
      );
    }

    // transação: cria aplicação e atualiza estoque
    const [application] = await db.$transaction([
      db.application.create({
        data: {
          productStockId: data.productStockId,
          quantity: data.quantity,
          date: data.date,
          notes: data.notes,
          companyId: data.companyId,
          cycleId: data.cycleId,
          talhaoId: data.talhaoId,
        },
        include: {
          productStock: {
            include: {
              product: true,
              farm: true,
            },
          },
          talhao: true,
        },
      }),
      db.productStock.update({
        where: { id: data.productStockId },
        data: { stock: stock.stock - data.quantity },
      }),
    ]);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao registrar aplicação." },
      { status: 500 }
    );
  }
}


const querySchema = z.object({
  farmId: z.string().cuid().optional(),
  talhaoId: z.string().cuid().optional(),
  cycleId: z.string().cuid().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const filters = querySchema.parse(query);

    const applications = await db.application.findMany({
      where: {
        ...(filters.farmId && {
          productStock: { farmId: filters.farmId },
        }),
        ...(filters.talhaoId && { talhaoId: filters.talhaoId }),
        ...(filters.cycleId && { cycleId: filters.cycleId }),
      },
      include: {
        productStock: {
          include: {
            product: true,
            farm: true,
          },
        },
        talhao: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar aplicações." },
      { status: 500 }
    );
  }
}
