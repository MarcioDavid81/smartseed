import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { withAccessControl } from "@/lib/api/with-access-control";
import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { canCompanyAddPurchase } from "@/lib/permissions/canCompanyAddPurchase";
import { db } from "@/lib/prisma";
import { inputPurchaseSchema } from "@/lib/schemas/inputSchema";
import { PaymentCondition } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/insumos/purchases:
 *   post:
 *     summary: Registrar nova compra de insumos
 *     tags:
 *       - Compra de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               invoiceNumber:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *               quantity:
 *                 type: number
 *               farmId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compra de insumo criada com sucesso
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

    const parsed = inputPurchaseSchema.safeParse(body);

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

    const product = await db.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Insumo não encontrado" },
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
      const purchase = await tx.purchase.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
      });

      // Atualiza/insere o estoque da fazenda
      await tx.productStock.upsert({
        where: {
          productId_farmId: {
            productId: data.productId,
            farmId: data.farmId,
          },
        },
        update: {
          stock: {
            increment: data.quantity,
          },
        },
        create: {
          productId: data.productId,
          farmId: data.farmId,
          stock: data.quantity,
          companyId: session.user.companyId,
        },
      });

      // Se for a prazo → cria conta a pagar
      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        await tx.accountPayable.create({
          data: {
            description: `Compra de ${product?.name ?? "insumo"}, cfe NF ${data.invoiceNumber ?? "S/NF"}, de ${customer?.name ?? "cliente"}`,
            amount: data.totalPrice,
            dueDate: new Date(data.dueDate),
            companyId: session.user.companyId,
            customerId: data.customerId,
            purchaseId: purchase.id,
          },
        });
      }

      return purchase;
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
 * /api/insumos/purchases:
 *   get:
 *     summary: Listar todas as compras de insumos da empresa do usuário logado
 *     tags:
 *       - Compra de Insumos
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
 *                   productId:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   invoiceNumber:
 *                     type: string
 *                   unitPrice:
 *                     type: number
 *                   totalPrice:
 *                     type: number
 *                   quantity:
 *                     type: number
 *                   farmId:
 *                     type: string
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

  try {
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const productId = searchParams.get("productId");

    const purchases = await db.purchase.findMany({
      where: {
        companyId,
        ...(farmId ? { farmId } : {}),
        ...(productId ? { productId } : {}),
      },
      include: {
        product: true,
        farm: true,
        customer: true,
        accountPayable: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(purchases, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar compras de insumos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar compras de insumos" },
      { status: 500 },
    );
  }
}
