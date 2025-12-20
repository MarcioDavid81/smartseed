import { db } from "@/lib/prisma";

export async function validateSeedStockForOutput(
  cultivarId: string,
  quantityKg: number
) {
  // Só valida se for saída
  if (quantityKg >= 0) return null;

  const cultivar = await db.cultivar.findUnique({
    where: { id: cultivarId },
    select: { stock: true },
  });

  if (!cultivar) {
    throw new Error("Cultivar não encontrada");
  }

  const required = Math.abs(quantityKg);

  if (cultivar.stock < required) {
    throw new Error(
      `Estoque insuficiente. Disponível: ${cultivar.stock} kg`
    );
  }

  return null;
}
