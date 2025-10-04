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
    const { name } = await req.json();

    const existing = await db.industryProduct.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Produto não encontrado ou acesso negado", { status: 403 });
    }

    const updated = await db.industryProduct.update({
      where: { id },
      data: {
        ...(name && { name }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
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

    // Buscar o produto para garantir que pertence à empresa do usuário
    const existing = await db.industryProduct.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Produto não encontrado ou acesso negado", { status: 403 });
    }

    // Verifica se o produto possui estoque
    const hasStock = await db.industryStock.findFirst({
      where: {
        industryProductId: id,
        industryDepositId: id,
        quantity: { gt: 0 },
      },
    });

    if (hasStock) {
      return new NextResponse("Produto possui estoque e não pode ser deletado", { status: 400 });
    }

    const deleted = await db.industryProduct.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}