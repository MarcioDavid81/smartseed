import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { validateStockForDeleteAdjust } from "@/app/_helpers/validateStockForDeleteAdjust";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return new NextResponse("Token inválido", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload;

    const { id } = params;

    const existingAdjust = await db.seedStockAdjustment.findUnique({
      where: { id },
      include: { cultivar: true },
    });

    if (!existingAdjust || existingAdjust.companyId !== companyId) {
      return new NextResponse("Ajuste não encontrado ou acesso negado", {
        status: 403,
      });
    }

    try {
      await validateStockForDeleteAdjust(
        existingAdjust.cultivarId,
        existingAdjust.quantityKg,
      );
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      // Deletar o ajuste
      await tx.seedStockAdjustment.delete({
        where: { id },
      });

      // Ajustar o estoque da cultivar
      await adjustStockWhenDeleteMov(
        tx,
        "Ajuste",
        existingAdjust.cultivarId,
        existingAdjust.quantityKg,
      );
    });

    return NextResponse.json({ message: "Ajuste excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir ajuste de estoque de sementes:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
