import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; 

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    // 1. Compras (entradas)
    const purchases = await db.purchase.findMany({
      where: { productId }, // 🔹 aqui faz sentido, é um produto comprado
      select: {
        id: true,
        date: true,
        quantity: true,
        farmId: true,
      },
    });

    const purchasesNormalized = purchases.map((p) => ({
      id: p.id,
      date: p.date,
      type: "COMPRA" as const,
      quantity: p.quantity,
      farmId: p.farmId,
      originFarm: null,
      destFarm: p.farmId,
      talhao: null,
    }));

    // 2. Transferências (saídas/entradas)
    const transfers = await db.transferExit.findMany({
      where: { productId }, // 🔹 apenas produto, não confundir com farms
      select: {
        id: true,
        date: true,
        quantity: true,
        originFarmId: true,
        destFarmId: true,
      },
    });

    const transfersNormalized = transfers.flatMap((t) => [
      {
        id: `${t.id}-out`,
        date: t.date,
        type: "TRANSFERENCIA" as const,
        quantity: -t.quantity,
        farmId: t.originFarmId,
        originFarm: t.originFarmId,
        destFarm: t.destFarmId,
        talhao: null,
      },
      {
        id: `${t.id}-in`,
        date: t.date,
        type: "TRANSFERENCIA" as const,
        quantity: t.quantity,
        farmId: t.destFarmId,
        originFarm: t.originFarmId,
        destFarm: t.destFarmId,
        talhao: null,
      },
    ]);

    // // 3. Aplicações (saídas)
    // const applications = await db.application.findMany({
    //   where: { productStockId: { product: { id: productId } } }, // 🔹 também produto
    //   select: {
    //     id: true,
    //     date: true,
    //     quantity: true,
    //     farmId: true,
    //     talhao: true,
    //   },
    // });

    // const applicationsNormalized = applications.map((a) => ({
    //   id: a.id,
    //   date: a.date,
    //   type: "APLICACAO" as const,
    //   quantity: -a.quantity,
    //   farmId: a.farmId,
    //   originFarm: a.farmId,
    //   destFarm: null,
    //   talhao: a.talhao,
    // }));

    // 🔹 Junta tudo
    const allMovements = [
      ...purchasesNormalized,
      ...transfersNormalized,
      // ...applicationsNormalized,
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 🔹 Calcula saldo acumulado
    let balance = 0;
    const extract = allMovements.map((m) => {
      balance += m.quantity;
      return { ...m, balance };
    });

    return NextResponse.json(extract);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao gerar extrato do produto" },
      { status: 500 }
    );
  }
}
