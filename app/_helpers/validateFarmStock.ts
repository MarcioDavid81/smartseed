import { db } from "@/lib/prisma";

export async function validateFarmStock(
  productId: string,
  farmId: string,
  quantityRequested: number
) {
  const stock = await db.productStock.findUnique({
    where: {
      productId_farmId: {
        productId,
        farmId,
      },
    },
  });

  if (!stock) {
    throw new Error("Esse insumo não possui estoque registrado nesta fazenda.");
  }

  if (stock.stock < quantityRequested) {
    throw new Error(
      `Estoque insuficiente na fazenda. Disponível: ${stock.stock}, solicitado: ${quantityRequested}.`
    );
  }

  return stock;
}
