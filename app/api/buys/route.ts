import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { seedBuySchema } from "@/lib/schemas/seedBuyScheema";
import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";

/**
 * @swagger
 * /api/buys:
 *   post:
 *     summary: Registrar nova compra de semente
 *     tags:
 *       - Compra de Semente
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
 *               invoice:
 *                 type: string
 *               unityPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *               quantityKg:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compra criada com sucesso
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

    const parsed = seedBuySchema.safeParse(body);

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

    const { purchaseOrderItemId } = data;

    let purchaseOrderItem = null;

    if (purchaseOrderItemId) {
      purchaseOrderItem = await db.purchaseOrderItem.findUnique({
        where: { id: purchaseOrderItemId },
        include: {
          purchaseOrder: true,
        },
      });

      if (!purchaseOrderItem) {
        return NextResponse.json(
          { error: "Item do pedido de compra não encontrado" },
          { status: 404 },
        );
      }

      if (
        purchaseOrderItem.purchaseOrder.status !== "OPEN" &&
        purchaseOrderItem.purchaseOrder.status !== "PARTIAL_FULFILLED"
      ) {
        return NextResponse.json(
          { error: "Pedido de compra não está aberto para remessas" },
          { status: 400 },
        );
      }

      const remaining =
        Number(purchaseOrderItem.quantity) -
        Number(purchaseOrderItem.fulfilledQuantity);

      if (data.quantityKg > remaining) {
        return NextResponse.json(
          {
            error: `Quantidade excede o saldo do pedido. Restante: ${remaining}`,
          },
          { status: 400 },
        );
      }
    }

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

    const result = await db.$transaction(async (tx) => {
      const buy = await tx.buy.create({
        data: {
          ...data,
          companyId: session.user.companyId,
          purchaseOrderItemId: purchaseOrderItemId ?? null,
        },
      });

      // Atualiza o pedido de compra se houver
      if (purchaseOrderItem) {
        await tx.purchaseOrderItem.update({
          where: { id: purchaseOrderItem.id },
          data: {
            fulfilledQuantity: {
              increment: data.quantityKg,
            },
          },
        });
      }

      // Atualiza o estoque da cultivar
      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: {
            increment: data.quantityKg,
          },
        },
      });

      // Se for a prazo → cria conta a pagar
      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        await tx.accountPayable.create({
          data: {
            description: `Compra de ${cultivar?.name ?? "semente"}, cfe NF ${data.invoice ?? "S/NF"}, de ${customer?.name ?? "cliente"}`,
            amount: data.totalPrice,
            dueDate: new Date(data.dueDate),
            companyId: session.user.companyId,
            customerId: data.customerId,
            buyId: buy.id,
          },
        });
      }
      return buy;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar compra:", error);
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
 * /api/buys:
 *   get:
 *     summary: Listar todas as compras da empresa do usuário logado
 *     tags:
 *       - Compra de Semente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras retornada com sucesso
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
 *                   invoice:
 *                     type: string
 *                   unityPrice:
 *                     type: number
 *                   totalPrice:
 *                     type: number
 *                   quantityKg:
 *                     type: number
 *                   notes:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;
  const cycleId = req.nextUrl.searchParams.get("cycleId");

  try {
    const buys = await db.buy.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        cultivar: {
          select: { id: true, name: true },
        },
        customer: {
          select: { id: true, name: true },
        },
        accountPayable: {
          select: { id: true, status: true, dueDate: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(buys, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
