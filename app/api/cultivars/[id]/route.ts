import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { name, product } = await req.json();

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const existing = await db.cultivar.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    const updated = await db.cultivar.update({
      where: { id },
      data: { name, product },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar cultivar:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const existing = await db.cultivar.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    const deleted = await db.cultivar.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar cultivar:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const cultivar = await db.cultivar.findUnique({ where: { id } });

    if (!cultivar || cultivar.companyId !== payload.companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    return NextResponse.json(cultivar);
  } catch (error) {
    console.error("Erro ao buscar cultivar:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
