import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { name } = await req.json();

    const existing = await db.industryDeposit.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Depósito não encontrado ou acesso negado", { status: 403 });
    }

    const updated = await db.industryDeposit.update({
      where: { id },
      data: {
        name,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar depósito:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    const existing = await db.industryDeposit.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Depósito não encontrado ou acesso negado", { status: 403 });
    }

    const hasStock = await db.industryStock.findFirst({
      where: {
        industryDepositId: id,
        quantity: { gt: 0 },
      },
    });

    if (hasStock) {
      return new NextResponse("Depósito possui estoque e não pode ser excluído", { status: 400 });
    }

    const deleted = await db.industryDeposit.delete({
      where: { id },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir depósito:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    const existing = await db.industryDeposit.findUnique({
      where: { id },
      include: {
        industryStocks: {
          select: {
            product: true,
            quantity: true,
          },
        },
      },
    });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Depósito não encontrado ou acesso negado", { status: 403 });
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) { 
    console.error("Erro ao obter depósito:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
