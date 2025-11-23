import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PaymentCondition, ProductType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { industrySaleSchema } from "@/lib/schemas/industrySale";
import { validateIndustryStock } from "@/app/_helpers/validateIndustryStock";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const body = await req.json();
    const parsed = industrySaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const cycle = await db.productionCycle.findFirst({
      where: {
        id: data.cycleId,
        companyId,
      },
      select: {
        productType: true,
      },
    });

    if (!cycle) {
      return NextResponse.json(
        { error: "Ciclo não encontrado ou não pertence à empresa" },
        { status: 404 },
      );
    }

    // 🔎 Busca o estoque industrial correspondente
    const industryStock = await db.industryStock.findFirst({
      where: {
        product: cycle.productType as ProductType,
        industryDepositId: data.industryDepositId,
      },
      select: { id: true },
    });

    if (!industryStock) {
      return NextResponse.json(
        { error: "Estoque industrial não encontrado" },
        { status: 404 },
      );
    }

    // ✅ Validação de estoque usando tua função atual
    const stockError = await validateIndustryStock(
      industryStock.id,
      data.weightLiq,
    );
    if (stockError) return stockError;

    // 💾 Transação principal
    const industrySale = await db.$transaction(async (tx) => {
      const cycle = await tx.productionCycle.findFirst({
        where: { id: data.cycleId, companyId },
        select: { productType: true },
      });

      if (!cycle) {
        throw new Error("Ciclo não encontrado ou não pertence à empresa");
      }

      // 🔹 Cria a venda
      const createdSale = await tx.industrySale.create({
        data: {
          ...data,
          date: new Date(data.date),
          companyId,
          product: cycle.productType as ProductType,
        },
      });

      // 🔹 Atualiza o estoque
      await tx.industryStock.update({
        where: {
          product_industryDepositId: {
            product: cycle.productType as ProductType,
            industryDepositId: data.industryDepositId,
          },
        },
        data: {
          quantity: {
            decrement: data.weightLiq,
          },
        },
      });

      // 🔹 Se for venda a prazo, cria conta a receber
      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId },
          select: { name: true },
        });

        const productLabel = cycle
          .productType!.toString()
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase());
        const document = data.document ?? "S/NF";
        const customerName = customer?.name ?? "cliente";

        await tx.accountReceivable.create({
          data: {
            description: `Venda de ${productLabel}, cfe NF ${document}, para ${customerName}`,
            amount: data.totalPrice,
            dueDate: new Date(data.dueDate),
            companyId,
            customerId: data.customerId,
            industrySaleId: createdSale.id,
          },
        });
      }

      return createdSale;
    });

    return NextResponse.json(industrySale, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda industrial:", error);
    return NextResponse.json(
      { error: "Falha ao registrar venda industrial" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;
  const cycleId = req.nextUrl.searchParams.get("cycleId");

  try {
    const industrySales = await db.industrySale.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        industryTransporter: {
          select: { id: true, name: true },
        },
        accountReceivable: {
          select: { id: true, status: true, dueDate: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(industrySales, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar venda industrial:", error);
    return NextResponse.json(
      { error: "Falha ao buscar venda industrial" },
      { status: 500 },
    );
  }
}
