import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
try {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  const productId = searchParams.get("productId");

  if (!farmId || !productId) {
    return NextResponse.json(
      { error: "farmId e productId são obrigatórios para o extrato de estoque" },
      { status: 400 },
    );
  }


  /**
   * 1️⃣ COMPRAS (ENTRADA)
   */
  const purchases = await db.purchase.findMany({
    where: {
      farmId,
      companyId,
      ...(productId && { productId }),
    },
    include: {
      product: true,
      farm: true,
    },
  });

  /**
   * 2️⃣ TRANSFERÊNCIAS (ENTRADA OU SAÍDA)
   */
  const transfers = await db.transferExit.findMany({
    where: {
      companyId,
      ...(productId && { productId }),
      OR: [{ originFarmId: farmId }, { destFarmId: farmId }],
    },
    include: {
      product: true,
      originFarm: true,
      destFarm: true,
    },
  });

  /**
   * 3️⃣ APLICAÇÕES (SAÍDA)
   */
  const applications = await db.application.findMany({
    where: {
      productStock: {
        farmId,
        companyId,
        ...(productId && { productId }),
      },
    },
    include: {
      productStock: {
        include: {
          product: true,
          farm: true,
        },
      },
      talhao: true,
    },
  });

  /**
   * 🔄 NORMALIZAÇÃO
   */
  const statement = [
    // COMPRAS
    ...purchases.map((p) => ({
      id: p.id,
      date: p.date,
      productId: p.productId,
      productName: p.product.name,
      farmId: p.farmId,
      farmName: p.farm.name,
      operation: "COMPRA" as const,
      type: "ENTRY" as const,
      quantityIn: p.quantity,
      quantityOut: 0,
      reference: `NF ${p.invoiceNumber}`,
    })),

    // TRANSFERÊNCIAS
    ...transfers.map((t) => {
      const isOrigin = t.originFarmId === farmId;

      return {
        id: t.id,
        date: t.date,
        productId: t.productId,
        productName: t.product.name,
        farmId: isOrigin ? t.originFarmId : t.destFarmId,
        farmName: isOrigin
          ? t.originFarm.name
          : t.destFarm.name,
        operation: "TRANSFERENCIA" as const,
        type: isOrigin ? "EXIT" as const : "ENTRY" as const,
        quantityIn: isOrigin ? 0 : t.quantity,
        quantityOut: isOrigin ? t.quantity : 0,
        reference: isOrigin
          ? `Para ${t.destFarm.name}`
          : `De ${t.originFarm.name}`,
      };
    }),

    // APLICAÇÕES
    ...applications.map((a) => ({
      id: a.id,
      date: a.date,
      productId: a.productStock.productId,
      productName: a.productStock.product.name,
      farmId: a.productStock.farmId,
      farmName: a.productStock.farm.name,
      operation: "APLICACAO" as const,
      type: "EXIT" as const,
      quantityIn: 0,
      quantityOut: a.quantity,
      reference: a.talhao.name,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  let balance = 0;
  const statementWithBalance = statement.map((item) => {
    balance += item.type === "ENTRY" ? item.quantityIn : -item.quantityOut;
    return {
      ...item,
      balance,
    };
  });

  const statementOrderedForUI = statementWithBalance.reverse();

  return NextResponse.json(statementOrderedForUI);
} catch (error) {
    console.error("STOCK STATEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao gerar extrato de insumos" },
      { status: 500 },
    );
  }
}
