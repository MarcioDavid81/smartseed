import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// Atualizar colheita
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { cultivarId, talhaoId, date, quantityKg, notes } = await req.json();

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const existing = await db.harvest.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", { status: 403 });
    }

    const updated = await db.harvest.update({
      where: { id },
      data: { 
        cultivarId,
        talhaoId,
        date: new Date(date),
        quantityKg,
        notes
       },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar colheita:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}


// Deletar colheita
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const existing = await db.harvest.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", { status: 403 });
    }

    await adjustStockWhenDeleteMov("colheita", existing.cultivarId, existing.quantityKg);

    const deleted = await db.harvest.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar colheita:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}


// Buscar colheita
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const colheita = await db.harvest.findUnique({ where: { id } });

    if (!colheita || colheita.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", { status: 403 });
    }

    return NextResponse.json(colheita);
  } catch (error) {
    console.error("Erro ao buscar colheita:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
