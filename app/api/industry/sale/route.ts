import { db } from "@/lib/prisma";
import { PaymentCondition, ProductType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { industrySaleSchema } from "@/lib/schemas/industrySale";
import { validateIndustryStock } from "@/app/_helpers/validateIndustryStock";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { recalcSaleContractStatus } from "@/app/_helpers/recalculateSaleContractStatus";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });

    const body = await req.json();

    const parsed = industrySaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: {
          code: "INVALID_DATA",
          title: "Dados inválidos",
          message: parsed.error.issues[0].message,
        },
      });
    }
    const data = parsed.data;

    const { saleContractItemId } = data;

    let saleContractItem = null;

    if (saleContractItemId) {
      saleContractItem = await db.saleContractItem.findUnique({
        where: { id: saleContractItemId },
        include: {
          saleContract: true,
        },
      });

      if (!saleContractItem) {
        return NextResponse.json(
          { error: "Item do contrato de venda não encontrado" },
          { status: 404 },
        );
      }

      if (
        saleContractItem.saleContract.status !== "OPEN" &&
        saleContractItem.saleContract.status !== "PARTIAL_FULFILLED"
      ) {
        return NextResponse.json(
          { error: "Contrato de venda não está aberto para remessas" },
          { status: 400 },
        );
      }

      const remaining =
        Number(saleContractItem.quantity) -
        Number(saleContractItem.fulfilledQuantity);

      if (data.weightLiq > remaining) {
        return NextResponse.json(
          {
            error: `Quantidade excede o saldo do pedido. Restante: ${remaining}`,
          },
          { status: 400 },
        );
      }
    }

    // 🔎 Busca o estoque industrial correspondente
    const industryStock = await db.industryStock.findFirst({
      where: {
        product: data.product,
        industryDepositId: data.industryDepositId,
      },
      select: { id: true },
    });

    if (!industryStock) {
      return NextResponse.json({
        error: {
          code: "NOT_FOUND",
          title: "Estoque industrial não encontrado",
          message:
            "O estoque industrial não foi encontrado ou não pertence à empresa.",
        },
      });
    }

    // ✅ Validação de estoque usando tua função atual
    const stockError = await validateIndustryStock(
      industryStock.id,
      data.weightLiq,
    );
    if (stockError) return stockError;

    // 💾 Transação principal
    const result = await db.$transaction(async (tx) => {
      // 🔹 Cria a venda
      const sale = await tx.industrySale.create({
        data: {
          ...data,
          date: new Date(data.date),
          companyId: session.user.companyId,
          product: data.product,
          industryTransporterId: data.industryTransporterId || null,
          saleContractItemId: saleContractItemId || null,
        },
      });

      // 🔹 Atualiza o contrato de venda se houver
      if (saleContractItem) {
        await tx.saleContractItem.update({
          where: { id: saleContractItem.id },
          data: {
            fulfilledQuantity: {
              increment: data.weightLiq,
            },
          },
        });
        await recalcSaleContractStatus(tx, saleContractItem.saleContractId);
      }

      //Valida se a quantidade do item da remessa não é maior que o saldo do contrato
      const item = await tx.saleContractItem.findUnique({
        where: { id: saleContractItemId },
      });
      if (Number(item?.fulfilledQuantity) > Number(item?.quantity)) {
        throw new Error("Quantidade excede o saldo do pedido.");
      }

      // 🔹 Atualiza o estoque
      await tx.industryStock.update({
        where: {
          product_industryDepositId: {
            product: data.product,
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

        const productLabel = data.product
          .toString()
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
            companyId: session.user.companyId,
            customerId: data.customerId,
            industrySaleId: sale.id,
          },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda industrial:", error);
    if (error instanceof PlanLimitReachedError) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }

    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        },
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const industrySales = await db.industrySale.findMany({
      where: { companyId },
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
      orderBy: [{ date: "desc" }, { document: "desc" }],
    });

    return NextResponse.json(industrySales, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar venda industrial:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        },
      },
      { status: 500 },
    );
  }
}
