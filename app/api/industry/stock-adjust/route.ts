import { getOrCreateIndustryStock } from "@/app/_helpers/getOrCreateIndustryStock";
import { validateIndustryStockForOutput } from "@/app/_helpers/validateIndustryStockForOutput";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { industryAdjustmentSchema } from "@/lib/schemas/industryAdjustStockSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload;

    const body = await req.json();
    const parsed = industryAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data

    const adjusted = await db.$transaction(async (tx) => {
      if (data.quantityKg < 0) {
        await validateIndustryStockForOutput({
          companyId,
          industryDepositId: data.industryDepositId,
          product: data.product,
          quantityKg: data.quantityKg,
        });
      }

      const stock = await getOrCreateIndustryStock({
        tx,
        companyId,
        industryDepositId: data.industryDepositId,
        product: data.product,
      });

      const adjustment = await tx.industryStockAdjustment.create({
        data: {
          companyId,
          industryDepositId: data.industryDepositId,
          product: data.product,
          date: data.date,
          quantityKg: data.quantityKg,
          notes: data.notes,
        },
      });

      await tx.industryStock.update({
        where: { id: stock.id },
        data: {
          quantity: {
            increment: data.quantityKg,
          },
        },
      });
      return adjustment;
    });

    return NextResponse.json(adjusted, { status: 201 });
  } catch (error) {
    console.error("Erro ao ajustar estoque de sementes:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { companyId } = payload;

    const adjustments = await db.industryStockAdjustment.findMany({
      where: { companyId },
      include: { industryDeposit: true },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Erro ao buscar ajustes de estoque de sementes:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
