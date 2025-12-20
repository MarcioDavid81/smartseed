import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

export async function validateIndustryStockForOutput({
  companyId,
  industryDepositId,
  product,
  quantityKg,
}: {
  companyId: string;
  industryDepositId: string;
  product: ProductType;
  quantityKg: number;
}) {
  const stock = await db.industryStock.findUnique({
    where: {
      product_industryDepositId: {
        product,
        industryDepositId,
      },
    },
  });

  if (!stock || Number(stock.quantity) < Math.abs(quantityKg)) {
    throw new Error(
      `Estoque insuficiente no depósito. Disponível: ${stock?.quantity ?? 0} kg`
    );
  }
}
