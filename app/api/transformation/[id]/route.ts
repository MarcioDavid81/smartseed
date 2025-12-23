import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function DELETE (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return new NextResponse("Token inválido", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload;
    const { id } = params;

    const existing = await db.transformation.findUnique({
      where: { id },
      include: {
        cultivar: true,
        destination: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Transformação não encontrada", { status: 404 });
    }
    
    await db.$transaction(async (tx) => {
      // 1️⃣ Reverter estoque da cultivar (incrementar)
      await tx.cultivar.update({
        where: { id: existing.cultivarId },
        data: {
          stock: {
            increment: existing.quantityKg,
          },
        },
      });

      // 2️⃣ Reverter estoque do depósito industrial
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: existing.destinationId,
            companyId: payload.companyId,
            product: existing.cultivar.product,
          },
          data: {
            quantity: {
              decrement: existing.quantityKg,
            },
          },
        });

      // 3️⃣ Excluir o beneficiamento
      await tx.transformation.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Transformação excluída com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}