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
      return NextResponse.json(
        {
          error: {
            code: "DEPOSIT_NOT_FOUND",
            title: "Depósito não encontrado",
            message: "O depósito com o ID fornecido não foi encontrado ou você não tem permissão para excluí-lo.",
          },
        },
        { status: 403 },
      );
    }

    const hasStock = await db.industryStock.findFirst({
      where: {
        industryDepositId: id,
        quantity: { gt: 0 },
      },
    });

    if (hasStock) {
      return NextResponse.json(
        {
          error: {
            code: "STOCK_PRESENT",
            title: "Estoque presente",
            message: "O depósito possui estoque e não pode ser excluído. Remova o estoque antes de excluir o depósito.",
          },
        },
        { status: 400 },
      );
    }

    const deleted = await db.industryDeposit.delete({
      where: { id },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir depósito:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          title: "Erro interno",
          message: "Ocorreu um erro ao excluir o depósito. Por favor, tente novamente.",
        },
      },
      { status: 500 },
    );
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
