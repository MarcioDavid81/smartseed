import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    const { id } = params;

    // ✅ 1. COLHEITAS (ENTRADA)
    const harvests = await db.harvest.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 2. COMPRA (ENTRADA)
    const purchases = await db.buy.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 3. VENDA (SAIDA)
    const sales = await db.saleExit.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 4. PLANTIO (SAIDA)
    const consumptions = await db.consumptionExit.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 5. DESCARTE (SAIDA)
    const beneficiations = await db.beneficiation.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 6. AJUSTE DE ESTOQUE (ENTRADA E SAIDA)
    const adjusts = await db.seedStockAdjustment.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 7. TRANSFORMAÇÃO (SAIDA)
    const transformations = await db.transformation.findMany({
      where: {
        companyId,
        cultivarId: id,
      },
    });

    // ✅ 8. NORMALIZAÇÃO
    const normalizedMovements = [
      ...harvests.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.date,
        quantity: Math.abs(Number(item.quantityKg)),
        type: "ENTRY" as const,
        origin: "HARVEST" as const,
        description: "Colheita",
      })),
      ...purchases.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.date,
        quantity: Math.abs(Number(item.quantityKg)),
        type: "ENTRY" as const,
        origin: "BUY" as const,
        description: "Compra",
      })),
      ...sales.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.date,
        quantity: Math.abs(Number(item.quantityKg)),
        type: "EXIT" as const,
        origin: "SALE" as const,
        description: "Venda",
      })),
      ...consumptions.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.date,
        quantity: Math.abs(Number(item.quantityKg)),
        type: "EXIT" as const,
        origin: "CONSUMPTION" as const,
        description: "Plantio",
      })),
      ...beneficiations.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.date,
        quantity: Math.abs(Number(item.quantityKg)),
        type: "EXIT" as const,
        origin: "BENEFICIATION" as const,
        description: "Descarte",
      })),
      ...adjusts.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.date,
        quantity: Math.abs(Number(item.quantityKg)),
        type: item.quantityKg > 0 ? ("ENTRY" as const) : ("EXIT" as const),
        origin: "ADJUSTMENT" as const,
        description:
          item.quantityKg > 0
            ? "Ajuste de estoque (entrada)"
            : "Ajuste de estoque (saída)",
      })),
      ...transformations.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.createdAt,
        quantity: Number(item.quantityKg),
        type: "EXIT" as const,
        origin: "TRANSFORMATION" as const,
        description: "Transformação",
      })),
    ];

    // ✅ 9. ORDENAÇÃO CRESCENTE PARA CÁLCULO
    normalizedMovements.sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();

      if (dateDiff !== 0) return dateDiff;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // ✅ 10. SALDO ACUMULADO CORRETO
    let balance = 0;
    const statementWithBalance = normalizedMovements.map((item) => {
      balance += item.type === "ENTRY" ? item.quantity : -item.quantity;
      return {
        ...item,
        balance,
      };
    });

    // ✅ 11. INVERTE PARA MOSTRAR DO ÚLTIMO PARA O PRIMEIRO
    const statementOrderedForUI = statementWithBalance.reverse();

    return NextResponse.json(statementOrderedForUI);
  } catch (error) {
    console.error("EXTRACT ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao gerar extrato da cultivar" },
      { status: 500 },
    );
  }
}
