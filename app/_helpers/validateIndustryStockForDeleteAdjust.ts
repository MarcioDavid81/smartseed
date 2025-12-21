import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

export async function validateIndustryStockForDeleteAdjust({
  industryDepositId,
  product,
  quantityKg,
}: {
  industryDepositId: string;
  product: ProductType;
  quantityKg: number;
}) {
  // Só valida se for exclusão de AJUSTE DE ENTRADA
  if (quantityKg <= 0) return;

  const amount = Math.abs(quantityKg);

  const stock = await db.industryStock.findUnique({
    where: {
      product_industryDepositId: {
        product,
        industryDepositId,
      },
    },
  });

  if (!stock || Number(stock.quantity) < amount) {
    throw new Error(
      `Não é possível excluir este ajuste. Estoque atual (${stock?.quantity ?? 0} kg) ficaria negativo.`
    );
  }
}
