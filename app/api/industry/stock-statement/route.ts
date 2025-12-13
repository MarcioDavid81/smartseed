import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const product = searchParams.get("product");
    const depositId = searchParams.get("depositId");
    const cycleId = searchParams.get("cycleId");

    if (!product || !depositId) {
      return NextResponse.json(
        { error: "Product e depositId são obrigatórios" },
        { status: 400 },
      );
    }

    // ✅ 1. COLHEITAS (ENTRADA)
    const harvests = await db.industryHarvest.findMany({
      where: {
        product: product as ProductType,
        industryDepositId: depositId,
        ...(cycleId && { cycleId }),
      },
    });

    // ✅ 2. DESCARTES (ENTRADA)
    const discards = await db.beneficiation.findMany({
      where: {
        cultivar: {
          product: product as ProductType,
        },
        destinationId: depositId,
        ...(cycleId && { cycleId }),
    },
  });

    // ✅ 3. VENDAS (SAÍDA)
    const sales = await db.industrySale.findMany({
      where: {
        product: product as ProductType,
        industryDepositId: depositId,
        ...(cycleId && { cycleId }),
      },
      include: {
        customer: true,
      },
    });

    // ✅ 4. TRANSFERÊNCIAS (SAÍDA)
    const transfersOut = await db.industryTransfer.findMany({
      where: {
        product: product as ProductType,
        fromDepositId: depositId,
        ...(cycleId && { cycleId }),
      },
      include: {
        toDeposit: true,
      },
    });

    // ✅ 5. TRANSFERÊNCIAS (ENTRADA)
    const transfersIn = await db.industryTransfer.findMany({
      where: {
        product: product as ProductType,
        toDepositId: depositId,
        ...(cycleId && { cycleId }),
      },
      include: {
        fromDeposit: true,
      },
    });

    // ✅ 6. NORMALIZAÇÃO
    const statement = [
      ...harvests.map((item) => ({
        id: item.id,
        date: item.date,
        quantity: Number(item.weightLiq),
        type: "ENTRY" as const,
        origin: "HARVEST" as const,
        description: "Colheita",
      })),

      ...discards.map((item) => ({
        id: item.id,
        date: item.date,
        quantity: Number(item.quantityKg),
        type: "ENTRY" as const,
        origin: "DISCARD" as const,
        description: "Descarte",
      })),

      ...sales.map((item) => ({
        id: item.id,
        date: item.date,
        quantity: Number(item.weightLiq),
        type: "EXIT" as const,
        origin: "SALE" as const,
        relatedCustomer: item.customer.name,
        description: `Venda  para ${item.customer.name} - Documento ${item.document ?? ""}`,
      })),

      ...transfersOut.map((item) => ({
        id: item.id,
        date: item.date,
        quantity: Number(item.quantity),
        type: "EXIT" as const,
        origin: "TRANSFER" as const,
        description: `Transferência para ${item.toDeposit.name}`,
        relatedDeposit: item.toDeposit.name,
      })),

      ...transfersIn.map((item) => ({
        id: item.id,
        date: item.date,
        quantity: Number(item.quantity),
        type: "ENTRY" as const,
        origin: "TRANSFER" as const,
        description: `Transferência vinda de ${item.fromDeposit.name}`,
        relatedDeposit: item.fromDeposit.name,
      })),
    ];

    // ✅ 7. ORDENAÇÃO CRESCENTE PARA CÁLCULO
    statement.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // ✅ 8. SALDO ACUMULADO CORRETO
    let balance = 0;
    const statementWithBalance = statement.map((item) => {
      balance += item.type === "ENTRY" ? item.quantity : -item.quantity;
      return {
        ...item,
        balance,
      };
    });

    // ✅ 9. INVERTE PARA MOSTRAR DO ÚLTIMO PARA O PRIMEIRO
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
