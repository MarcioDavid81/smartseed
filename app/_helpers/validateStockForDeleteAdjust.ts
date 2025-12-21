import { db } from "@/lib/prisma";

export async function validateStockForDeleteAdjust(
  cultivarId: string,
  quantityKg: number
) {
  // Só valida se for exclusão de AJUSTE DE ENTRADA
  if (quantityKg <= 0) return;

  const amount = Math.abs(quantityKg);

  const cultivar = await db.cultivar.findUnique({
    where: { id: cultivarId },
    select: { stock: true },
  });

  if (!cultivar) {
    throw new Error("Cultivar não encontrada");
  }

  if (cultivar.stock < amount) {
    throw new Error(
      `Não é possível excluir este ajuste. Estoque atual (${cultivar.stock} kg) ficaria negativo.`
    );
  }
}
