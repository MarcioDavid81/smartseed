import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { searchParams } = new URL(req.url);
    const product = searchParams.get("product");
    const depositId = searchParams.get("depositId");

    if (!product || !depositId) {
      return NextResponse.json(
        { error: "Product e depositId são obrigatórios" },
        { status: 400 },
      );
    }

    // ✅ 1. COLHEITAS (ENTRADA)
    const harvests = await db.industryHarvest.findMany({
      where: {
        companyId,
        product: product as ProductType,
        industryDepositId: depositId,
      },
    });

    // ✅ 2. DESCARTES (ENTRADA)
    const discards = await db.beneficiation.findMany({
      where: {
        companyId,
        cultivar: {
          product: product as ProductType,
        },
        destinationId: depositId,
      },
    });

    // ✅ 3. VENDAS (SAÍDA)
    const sales = await db.industrySale.findMany({
      where: {
        companyId,
        product: product as ProductType,
        industryDepositId: depositId,
      },
      include: {
        customer: true,
      },
    });

    // ✅ 4. TRANSFERÊNCIAS (SAÍDA)
    const transfersOut = await db.industryTransfer.findMany({
      where: {
        companyId,
        product: product as ProductType,
        fromDepositId: depositId,
      },
      include: {
        toDeposit: true,
      },
    });

    // ✅ 5. TRANSFERÊNCIAS (ENTRADA)
    const transfersIn = await db.industryTransfer.findMany({
      where: {
        companyId,
        product: product as ProductType,
        toDepositId: depositId,
      },
      include: {
        fromDeposit: true,
      },
    });

    // ✅ 6. AJUSTES DE ESTOQUE (ENTRADA E SAÍDA)
    const adjustments = await db.industryStockAdjustment.findMany({
      where: {
        companyId,
        product: product as ProductType,
        industryDepositId: depositId,
      },
    });

    // ✅ 6. TRANSFORMAÇÕES (ENTRADA)
    const transformations = await db.transformation.findMany({
      where: {
        companyId,
        cultivar: {
          product: product as ProductType,
        },
        destinationId: depositId,
      },
    });

    // ✅ 7. NORMALIZAÇÃO
    const statement = [
      ...harvests.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.createdAt,
        quantity: Number(item.weightLiq),
        type: "ENTRY" as const,
        origin: "HARVEST" as const,
        description: "Colheita",
      })),

      ...discards.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.createdAt,
        quantity: Number(item.quantityKg),
        type: "ENTRY" as const,
        origin: "DISCARD" as const,
        description: "Descarte",
      })),

      ...sales.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.createdAt,
        quantity: Number(item.weightLiq),
        type: "EXIT" as const,
        origin: "SALE" as const,
        relatedCustomer: item.customer.name,
        description: `Venda  para ${item.customer.name} - Documento ${item.document ?? ""}`,
      })),

      ...transfersOut.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.createdAt,
        quantity: Number(item.quantity),
        type: "EXIT" as const,
        origin: "TRANSFER" as const,
        description: `Transferência para ${item.toDeposit.name}`,
        relatedDeposit: item.toDeposit.name,
      })),

      ...transfersIn.map((item) => ({
        id: item.id,
        date: item.date,
        createdAt: item.createdAt,
        quantity: Number(item.quantity),
        type: "ENTRY" as const,
        origin: "TRANSFER" as const,
        description: `Transferência vinda de ${item.fromDeposit.name}`,
        relatedDeposit: item.fromDeposit.name,
      })),

      ...adjustments.map((item) => ({
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
        type: "ENTRY" as const,
        origin: "TRANSFORMATION" as const,
        description: "Transformação",
      })),
    ];

    // ✅ 8. ORDENAÇÃO CRESCENTE PARA CÁLCULO
    statement.sort((a, b) => {
  const dateDiff =
    new Date(a.date).getTime() - new Date(b.date).getTime();

  if (dateDiff !== 0) return dateDiff;

  return (
    new Date(a.createdAt).getTime() -
    new Date(b.createdAt).getTime()
  );
});


    // ✅ 9. SALDO ACUMULADO CORRETO
    let balance = 0;
    const statementWithBalance = statement.map((item) => {
      balance += item.type === "ENTRY" ? item.quantity : -item.quantity;
      return {
        ...item,
        balance,
      };
    });

    // ✅ 10. INVERTE PARA MOSTRAR DO ÚLTIMO PARA O PRIMEIRO
    const statementOrderedForUI = statementWithBalance.reverse();

    return NextResponse.json(statementOrderedForUI);
  } catch (error) {
    console.error("STOCK STATEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao gerar extrato da indústria" },
      { status: 500 },
    );
  }
}
