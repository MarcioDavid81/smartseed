import { OperationType, Prisma } from "@prisma/client";

export async function adjustStockWhenDeleteMov(
  tx: Prisma.TransactionClient,
  _tipo: OperationType,
  cultivarId: string,
  quantidadeAplicada: number,
) {
  await tx.cultivar.update({
    where: { id: cultivarId },
    data: {
      stock: {
        increment: -quantidadeAplicada,
      },
    },
  });
}

