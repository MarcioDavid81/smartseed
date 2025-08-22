import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const {
      productId,
      customerId,
      date,
      invoiceNumber,
      unitPrice,
      totalPrice,
      quantity,
      unit,
      farmId,
      notes,
    } = await req.json();

    // 1. Buscar a compra e validar empresa
    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    const updated = await db.$transaction(async (tx) => {
      // 2. Se quantidade, produto ou fazenda mudaram, ajustar estoque
      if (
        existing.quantity !== quantity ||
        existing.productId !== productId ||
        existing.farmId !== farmId
      ) {
        // Reverter estoque anterior
        await tx.productStock.update({
          where: {
            productId_farmId: {
              productId: existing.productId,
              farmId: existing.farmId,
            },
          },
          data: {
            stock: {
              decrement: existing.quantity,
            },
          },
        });

        // Aplicar novo impacto
        await tx.productStock.upsert({
          where: {
            productId_farmId: {
              productId,
              farmId,
            },
          },
          update: {
            stock: {
              increment: quantity,
            },
          },
          create: {
            productId,
            farmId,
            companyId: payload.companyId,
            stock: quantity,
          },
        });
      }

      // 3. Atualizar compra
      return await tx.purchase.update({
        where: { id },
        data: {
          productId,
          customerId,
          date: new Date(date),
          invoiceNumber,
          unitPrice,
          totalPrice,
          quantity,
          unit,
          farmId,
          notes,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}


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

    // 1. Buscar compra e validar empresa
    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    const deleted = await db.$transaction(async (tx) => {
      // 2. Ajustar estoque
      await tx.productStock.update({
        where: {
          productId_farmId: {
            productId: existing.productId,
            farmId: existing.farmId,
          },
        },
        data: {
          stock: {
            decrement: existing.quantity,
          },
        },
      });

      // 3. Excluir compra
      return await tx.purchase.delete({ where: { id } });
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}


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

    const purchase = await db.purchase.findUnique({
      where: { id },
      include: {
        product: true,  // traz informações do insumo
        customer: true, // traz fornecedor
        farm: true,     // traz fazenda
      },
    });

    if (!purchase || purchase.companyId !== payload.companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Erro ao buscar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}