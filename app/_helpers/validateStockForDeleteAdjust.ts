import { db } from "@/lib/prisma";

export async function validateStockForDeleteAdjust(
  cultivarId: string,
  quantityKg: number
) {
  if (quantityKg <= 0) {
    // deletar saída nunca causa problema
    return;
  }

  const cultivar = await db.cultivar.findUnique({
    where: { id: cultivarId },
    select: { stock: true },
  });

  if (!cultivar) {
    throw new Error("Cultivar não encontrada");
  }

  if (cultivar.stock < quantityKg) {
    throw new Error(
      `Não é possível excluir este ajuste. Estoque atual (${cultivar.stock} kg) ficaria negativo.`
    );
  }
}
