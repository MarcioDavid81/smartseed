import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { ProductType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";

const updateTransferSchema = z.object({
  date: z.coerce.date().optional(),
  product: z.nativeEnum(ProductType).optional(),
  fromDepositId: z.string().cuid().optional(),
  toDepositId: z.string().cuid().optional(),
  quantity: z.number().positive().optional(),
  document: z.string().optional(),
  observation: z.string().optional(),
  cycleId: z.string().cuid().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    const transferId = params.id;

    // Busca transferência existente
    const existingTransfer = await db.industryTransfer.findUnique({
      where: { id: transferId },
    });

    if (!existingTransfer || existingTransfer.companyId !== companyId) {
      return NextResponse.json(
        { error: "Transferência não encontrada para esta empresa." },
        { status: 404 },
      );
    }

    const body = await req.json();
    const parsed = updateTransferSchema.parse(body);

    // Evita origem = destino
    if (
      parsed.fromDepositId &&
      parsed.toDepositId &&
      parsed.fromDepositId === parsed.toDepositId
    ) {
      return NextResponse.json(
        { error: "Depósito de origem e destino devem ser diferentes." },
        { status: 400 },
      );
    }

    // Busca estoques de origem e destino (atuais ou novos)
    const currentFromDepositId =
      parsed.fromDepositId ?? existingTransfer.fromDepositId;
    const currentToDepositId =
      parsed.toDepositId ?? existingTransfer.toDepositId;
    const currentProduct = parsed.product ?? existingTransfer.product;
    const newQuantity = parsed.quantity ?? existingTransfer.quantity.toNumber();

    const originStock = await db.industryStock.findUnique({
      where: {
        product_industryDepositId: {
          product: currentProduct,
          industryDepositId: currentFromDepositId,
        },
      },
    });

    const destStock = await db.industryStock.findUnique({
      where: {
        product_industryDepositId: {
          product: currentProduct,
          industryDepositId: currentToDepositId,
        },
      },
    });

    if (!originStock || originStock.companyId !== companyId) {
      return NextResponse.json(
        { error: "Estoque de origem não encontrado para esta empresa." },
        { status: 404 },
      );
    }

    // Transação — ajusta diferenças se houver mudança
    const updatedTransfer = await db.$transaction(async (tx) => {
      const oldQuantity = existingTransfer.quantity.toNumber();
      const quantityDiff = newQuantity - oldQuantity;

      // Caso altere depósitos ou quantidade, ajusta estoques
      if (
        existingTransfer.fromDepositId !== currentFromDepositId ||
        existingTransfer.toDepositId !== currentToDepositId ||
        quantityDiff !== 0
      ) {
        // Reverte movimentação antiga
        await tx.industryStock.update({
          where: { id: originStock.id },
          data: { quantity: { increment: oldQuantity } },
        });

        await tx.industryStock.update({
          where: { id: destStock?.id },
          data: { quantity: { decrement: oldQuantity } },
        });

        // Garante estoque destino válido
        let finalDestStock = destStock;
        if (!finalDestStock) {
          finalDestStock = await tx.industryStock.create({
            data: {
              product: currentProduct,
              industryDepositId: currentToDepositId,
              companyId,
              quantity: 0,
            },
          });
        }

        // Aplica nova movimentação
        await tx.industryStock.update({
          where: { id: originStock.id },
          data: { quantity: { decrement: newQuantity } },
        });

        await tx.industryStock.update({
          where: { id: finalDestStock.id },
          data: { quantity: { increment: newQuantity } },
        });
      }

      // Atualiza registro da transferência
      return tx.industryTransfer.update({
        where: { id: transferId },
        data: {
          ...parsed,
          quantity: newQuantity,
        },
        include: {
          fromDeposit: { select: { id: true, name: true } },
          toDeposit: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json(updatedTransfer, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });

    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const existing = await db.industryTransfer.findUnique({
      where: { id },
      include: {
        fromDeposit: true,
        toDeposit: true,
      }
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({
        error: {
          code: "TRANSFER_NOT_FOUND",
          title: "Transferência não encontrada",
          message: "A transferência não foi localizada ou você não tem permissão para acessá-la.",
        },
      }, { status: 403 });
    }

    const transferWeight = Number(existing.quantity);

    // ✅ Estoque do DEPÓSITO DE DESTINO (onde precisa ter saldo)
    const toStock = await db.industryStock.findUnique({
      where: {
        product_industryDepositId: {
          product: existing.product,
          industryDepositId: existing.toDepositId,
        },
      },
    });

    const toCurrentQuantity = Number(toStock?.quantity ?? 0);

    if (transferWeight > toCurrentQuantity) {
      return NextResponse.json({
        error: {
          code: "INSUFFICIENT_STOCK",
          title: "Estoque insuficiente",
          message: `O depósito de destino possui ${toCurrentQuantity} kg, e a transferência é de ${transferWeight} kg. A exclusão deixaria o estoque negativo.`,
        },
      }, { status: 400 });
    }

    // ✅ Estoque do DEPÓSITO DE ORIGEM (onde será devolvido)
    const fromStock = await db.industryStock.findUnique({
      where: {
        product_industryDepositId: {
          product: existing.product,
          industryDepositId: existing.fromDepositId,
        },
      },
    });

    const fromCurrentQuantity = Number(fromStock?.quantity ?? 0);

    // ✅ TRANSAÇÃO ATÔMICA
    await db.$transaction(async (tx) => {
      // ✅ Devolve para a origem
      await tx.industryStock.update({
        where: {
          product_industryDepositId: {
            product: existing.product,
            industryDepositId: existing.fromDepositId,
          },
        },
        data: {
          quantity: fromCurrentQuantity + transferWeight,
        }
      });

      // ✅ Remove do destino
      await tx.industryStock.update({
        where: {
          product_industryDepositId: {
            product: existing.product,
            industryDepositId: existing.toDepositId,
          },
        },
        data: {
          quantity: toCurrentQuantity - transferWeight,
        }
      });

      // ✅ Remove transferência
      await tx.industryTransfer.delete({
        where: { id }
      });
    });

    return NextResponse.json(
      { message: "Transferência removida e estoque revertido com sucesso" },
      { status: 200 },
    );

  } catch (error) {
    console.error("Erro ao remover transferência:", error);
    return NextResponse.json({
      error: {
        code: "DELETE_TRANSFER_ERROR",
        title: "Erro ao remover transferência",
        message: "Ocorreu um erro inesperado durante a tentativa de remover a transferência.",
      },
    }, { status: 500 });
  }
}
