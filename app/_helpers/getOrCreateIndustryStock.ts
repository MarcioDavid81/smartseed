import { Prisma, ProductType } from "@prisma/client";

export async function getOrCreateIndustryStock({
  tx,
  companyId,
  industryDepositId,
  product,
}: {
  tx: Prisma.TransactionClient;
  companyId: string;
  industryDepositId: string;
  product: ProductType;
}) {
  const stock = await tx.industryStock.findUnique({
    where: {
      product_industryDepositId: {
        product,
        industryDepositId,
      },
    },
  });

  if (stock) return stock;

  return tx.industryStock.create({
    data: {
      companyId,
      industryDepositId,
      product,
      quantity: 0,
    },
  });
}
