import { db } from "@/lib/prisma";


export async function updateCultivarStock(cultivarId: string) {
  const harvests = await db.harvest.findMany({
    where: { cultivarId },
    select: { quantityKg: true },
  });

  const buys = await db.buy.findMany({
    where: { cultivarId },
    select: { quantityKg: true },
  });

  const sales = await db.saleExit.findMany({
    where: { cultivarId },
    select: { quantityKg: true },
  });

  const consumptions = await db.consumptionExit.findMany({
    where: { cultivarId },
    select: { quantityKg: true },
  });

  const discards = await db.beneficiation.findMany({
    where: { cultivarId },
    select: { quantityKg: true },
  });

  const totalIn =
    harvests.reduce((acc, h) => acc + h.quantityKg, 0) +
    buys.reduce((acc, b) => acc + b.quantityKg, 0);

  const totalOut =
    sales.reduce((acc, s) => acc + s.quantityKg, 0) +
    consumptions.reduce((acc, c) => acc + c.quantityKg, 0) +
    discards.reduce((acc, d) => acc + d.quantityKg, 0);

  const stock = totalIn - totalOut;

  await db.cultivar.update({
    where: { id: cultivarId },
    data: { stock },
  });
}
