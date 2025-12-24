import { validateIndustryStockForDeleteAdjust } from "@/app/_helpers/validateIndustryStockForDeleteAdjust";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const existingAdjust = await db.industryStockAdjustment.findUnique({
      where: { id },
    });

    if (!existingAdjust || existingAdjust.companyId !== companyId) {
      return NextResponse.json(
        { 
          code: "NOT_FOUND",
          title: "Ajuste não encontrado",
          message: "O ajuste de estoque não foi encontrado. Por favor, verifique o ID e tente novamente.",
        },
        { status: 404 }
      );
    }

    // 🔐 VALIDAÇÃO CRÍTICA
    await validateIndustryStockForDeleteAdjust({
      industryDepositId: existingAdjust.industryDepositId,
      product: existingAdjust.product,
      quantityKg: Number(existingAdjust.quantityKg),
    });

    await db.$transaction(async (tx) => {
      await tx.industryStockAdjustment.delete({
        where: { id },
      });

      // Reverte o efeito do ajuste
      await tx.industryStock.update({
        where: {
          product_industryDepositId: {
            product: existingAdjust.product,
            industryDepositId: existingAdjust.industryDepositId,
          },
        },
        data: {
          quantity: {
            decrement: existingAdjust.quantityKg,
          },
        },
      });
    });

    return NextResponse.json({ message: "Ajuste excluído com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { 
        code: "INVALID_INPUT",
        title: "Dados inválidos",
        message: error.message,
      },
      { status: 400 }
    );
  }
}
