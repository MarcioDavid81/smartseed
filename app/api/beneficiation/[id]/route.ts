import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Atualizar descarte
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { cultivarId, date, quantityKg, notes } = await req.json();

    // Buscar o descarte para garantir que pertence à empresa do usuário
    const existing = await db.beneficiation.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    const updated = await db.beneficiation.update({
      where: { id },
      data: {
        cultivarId,
        date: new Date(date),
        quantityKg,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Deletar descarte
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const existing = await db.beneficiation.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    await adjustStockWhenDeleteMov(
      "descarte",
      existing.cultivarId,
      existing.quantityKg
    );

    const deleted = await db.beneficiation.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Buscar descarte
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o descarte para garantir que pertence à empresa do usuário
    const descarte = await db.beneficiation.findUnique({ where: { id } });

    if (!descarte || descarte.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(descarte);
  } catch (error) {
    console.error("Erro ao buscar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
