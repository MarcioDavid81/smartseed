import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function validateStock(cultivarId: string, quantityKg: number) {
  //pegar do banco de dados a cultivar pelo id
  const cultivar = await db.cultivar.findUnique({
    where: { id: cultivarId },
  });

  //se não existir cultivar, parar a execução e retornar o erro
  if (!cultivar) {
    return NextResponse.json(
      { error: "Cultivar não encontrada" },
      { status: 404 }
    );
  }

  //se a quantidade for maior que o estoque, parar a execução e retornar o erro
  if (cultivar.stock < quantityKg) {
    return NextResponse.json(
      { error: `Estoque insuficiente. Disponível: ${cultivar.stock} kg` },
      { status: 400 }
    );
  }

  return null; // tudo certo
}