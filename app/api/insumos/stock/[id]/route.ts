import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return NextResponse.json({ error: "Token ausente" }, { status: 401 });
        }
    
        const token = authHeader.split(" ")[1];
        const payload = await verifyToken(token);
    
        if (!payload || !payload.companyId) {
          return NextResponse.json(
            { error: "Token inválido ou sem companyId" },
            { status: 401 },
          );
        }

    const productId = params.productId;

    // Compras (entrada)
    const purchases = await db.purchase.findMany({
      where: { productId, companyId: payload.companyId },
      include: { farm: true },
    });

    // Transferências (saídas da origem)
    const transferOuts = await db.transferExit.findMany({
      where: { productId, companyId: payload.companyId },
      include: { originFarm: true },
    });

    // Transferências (entradas no destino)
    const transferIns = await db.transferExit.findMany({
      where: { productId, companyId: payload.companyId },
      include: { destFarm: true },
    });

    // // Aplicações (consumo)
    // const consumptions = await db.application.findMany({
    //   where: { productStockId: { product: { id: productId } }, companyId: payload.companyId },
    //   include: { farm: true },
    // });

    // Normalização
    const extract = [
      ...purchases.map((p) => ({
        id: p.id,
        date: p.date,
        type: "COMPRA",
        farmId: p.farmId,
        farmName: p.farm.name,
        productId: p.productId,
        quantity: p.quantity,
      })),
      ...transferOuts.map((t) => ({
        id: t.id,
        date: t.date,
        type: "TRANSFERENCIA",
        farmId: t.originFarmId,
        farmName: t.originFarm.name,
        productId: t.productId,
        quantity: -t.quantity, // saída negativa
      })),
      ...transferIns.map((t) => ({
        id: t.id,
        date: t.date,
        type: "TRANSFERENCIA",
        farmId: t.destFarmId,
        farmName: t.destFarm.name,
        quantity: t.quantity, // entrada positiva
      })),
      // ...consumptions.map((c) => ({
      //   id: c.id,
      //   date: c.date,
      //   type: "APLICACAO",
      //   farmId: c.farmId,
      //   farmName: c.farm.name,
      //   quantity: -c.quantity, // saída negativa
      //   unit: c.unit,
      // })),
    ];

    // Ordenar por data
    extract.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(extract);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao gerar extrato do produto" },
      { status: 500 }
    );
  }
}
