import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function validateIndustryStock(industryStockId: string, quantity: number) {
  const productStock = await db.industryStock.findUnique({
    where: { id: industryStockId }
  })

  if (!productStock) {
    return NextResponse.json(
      { error: "Estoque de produto não encontrado" },
      { status: 404 }
    );
  }

  if (productStock.quantity.toNumber() < quantity) {
    return NextResponse.json(
      { error: `Estoque insuficiente. Disponível: ${productStock.quantity} kg` },
      { status: 400 }
    );
  }
  return null;
}