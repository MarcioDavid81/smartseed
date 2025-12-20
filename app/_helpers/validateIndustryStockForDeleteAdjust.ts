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
  if (quantityKg <= 0) return;

  const stock = await db.industryStock.findUnique({
    where: {
      product_industryDepositId: {
        product,
        industryDepositId,
      },
    },
  });

  if (!stock || Number(stock.quantity) < quantityKg) {
    throw new Error(
      `Não é possível excluir este ajuste. Estoque atual ficaria negativo.`
    );
  }
}
