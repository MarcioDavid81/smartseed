import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload

    const { date, type, quantityKg, cultivarId, notes } = await req.json();

    const existing = await db.cultivar.findUnique({ where: { id: cultivarId } });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    const adjusted = await db.seedStockAdjustment.create({
      data: {
        date: new Date(date),
        type,
        quantityKg,
        cultivarId,
        companyId,
        notes,
      },
    });

    await db.cultivar.update({
      where: { id: cultivarId },
      data: {
          stock: {
            increment: type === "Increase" ? quantityKg : -quantityKg,
          }
      },
    })

    return NextResponse.json(adjusted);
  } catch (error) {
    console.error("Erro ao ajustar estoque de sementes:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}