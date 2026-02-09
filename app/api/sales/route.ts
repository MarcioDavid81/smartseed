import { validateStock } from "@/app/_helpers/validateStock";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { withAccessControl } from "@/lib/api/with-access-control";
import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { seedSaleSchema } from "@/lib/schemas/seedSaleSchema";
import { PaymentCondition } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Registrar nova venda
 *     tags:
 *       - Venda
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cultivarId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantityKg:
 *                 type: number
 *               invoiceNumber:
 *                 type: string
 *               saleValue:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venda criada com sucesso
 */
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

    const parsed = seedSaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
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

      if (data.quantityKg > remaining) {
        return NextResponse.json(
          {
            error: `Quantidade excede o saldo do pedido. Restante: ${remaining}`,
          },
          { status: 400 },
        );
      }
    }

    const stockValidation = await validateStock(
      data.cultivarId,
      data.quantityKg,
    );
    if (stockValidation) return stockValidation;

    const cultivar = await db.cultivar.findUnique({
      where: { id: data.cultivarId },
      select: { id: true, name: true, product: true },
    });

    if (!cultivar) {
      return NextResponse.json(
        { error: "Cultivar não encontrada" },
        { status: 404 },
      );
    }

    const customer = await db.customer.findUnique({
      where: { id: data.customerId },
      select: { id: true, name: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    // 🔄 Tudo dentro de uma transação para garantir integridade
    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Cria o registro da venda
      const sale = await tx.saleExit.create({
        data: {
          ...data,
          companyId: session.user.companyId,
          saleContractItemId: saleContractItemId ?? null,
        },
      });

      // 2️⃣ Atualiza o contrato de venda se houver
      if (saleContractItem) {
        await tx.saleContractItem.update({
          where: { id: saleContractItem.id },
          data: {
            fulfilledQuantity: {
              increment: data.quantityKg,
            },
          },
        });
      }

      // 3️⃣ Atualiza o estoque da cultivar (decrementa)
      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: { decrement: data.quantityKg },
        },
      });

      // 4️⃣ Se for a prazo → cria conta a receber
      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        await tx.accountReceivable.create({
          data: {
            description: `Venda de ${cultivar?.name ?? "semente"}, cfe NF ${data.invoiceNumber ?? "S/NF"}, para ${customer?.name ?? "cliente"}`,
            amount: data.saleValue,
            dueDate: new Date(data.dueDate),
            companyId: session.user.companyId,
            customerId: data.customerId,
            saleExitId: sale.id,
          },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
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

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Listar todas as vendas da empresa do usuário logado
 *     tags:
 *       - Venda
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   cultivarId:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   quantityKg:
 *                     type: number
 *                   invoiceNumber:
 *                     type: string
 *                   saleValue:
 *                      type: number
 *                   notes:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
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
    const sales = await db.saleExit.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        cultivar: {
          select: { id: true, name: true },
        },
        customer: {
          select: { id: true, name: true },
        },
        accountReceivable: {
          select: { id: true, status: true, dueDate: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
