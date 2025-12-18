import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { seedAdjustmentSchema } from "@/lib/schemas/seedAdjustStockSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload;

    const body = await req.json();
    const parsed = seedAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await db.cultivar.findUnique({
      where: { id: data.cultivarId },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", {
        status: 403,
      });
    }

    const adjusted = await db.$transaction(async (tx) => {
      const adjustment = await tx.seedStockAdjustment.create({
        data: {
          date: new Date(data.date),
          quantityKg: data.quantityKg,
          cultivarId: data.cultivarId,
          companyId,
          notes: data.notes,
        },
      });

      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: {
            increment: data.quantityKg,
          },
        },
      });

      return adjustment;
    });

    return NextResponse.json(adjusted, { status: 201 });
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

    const { companyId } = payload;

    const adjustments = await db.seedStockAdjustment.findMany({
      where: { companyId },
      include: { cultivar: true },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Erro ao buscar ajustes de estoque de sementes:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
