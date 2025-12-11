import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AdjustmentType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const adjustamentSchema = z.object({
  date: z.coerce.date(),
  type: z.nativeEnum(AdjustmentType),
  quantityKg: z.number().positive(),
  cultivarId: z.string(),
  notes: z.string().optional(),
});

export type SeedAdjustStock = z.infer<typeof adjustamentSchema>;

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload

    const body = await req.json();
    const parsed = adjustamentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;


    const existing = await db.cultivar.findUnique({ where: { id: data.cultivarId } });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    const adjusted = await db.seedStockAdjustment.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        quantityKg: data.quantityKg,
        cultivarId: data.cultivarId,
        companyId,
        notes: data.notes,
      },
    });

    await db.cultivar.update({
      where: { id: data.cultivarId },
      data: {
          stock: {
            increment: data.type === AdjustmentType.Increase ? data.quantityKg : -data.quantityKg,
          }
      },
    })

    return NextResponse.json(adjusted);
  } catch (error) {
    console.error("Erro ao ajustar estoque de sementes:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload

    const adjustments = await db.seedStockAdjustment.findMany({
      where: { companyId },
      include: { cultivar: true },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Erro ao buscar ajustes de estoque de sementes:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}