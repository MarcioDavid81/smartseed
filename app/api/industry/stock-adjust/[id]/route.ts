import { validateIndustryStockForDeleteAdjust } from "@/app/_helpers/validateIndustryStockForDeleteAdjust";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return new NextResponse("Token inválido", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload;
    const { id } = params;

    const existingAdjust = await db.industryStockAdjustment.findUnique({
      where: { id },
    });

    if (!existingAdjust || existingAdjust.companyId !== companyId) {
      return new NextResponse("Ajuste não encontrado", { status: 404 });
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
      { error: error.message },
      { status: 400 }
    );
  }
}
