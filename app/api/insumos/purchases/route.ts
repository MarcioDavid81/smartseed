import { verifyToken } from "@/lib/auth";
import { canCompanyAddPurchase } from "@/lib/permissions/canCompanyAddPurchase";
import { db } from "@/lib/prisma";
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
  const allowed = await canCompanyAddPurchase();
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Limite de registros atingido para seu plano. Faça upgrade para continuar.",
      },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const {
      productId,
      customerId,
      date,
      invoiceNumber,
      unitPrice,
      totalPrice,
      quantity,
      farmId,
      notes,
      paymentCondition,
      dueDate,
    } = await req.json();

    if (!productId || !date || !invoiceNumber || !quantity || !farmId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Cria a compra
    const purchase = await db.purchase.create({
      data: {
        productId,
        customerId,
        date: new Date(date),
        invoiceNumber,
        unitPrice,
        totalPrice,
        quantity,
        farmId,
        notes,
        companyId,
        type: "COMPRA", // vem do enum InsumoOperationType
        paymentCondition,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    // Se for a prazo → cria conta a pagar
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
      },
    });
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      select: {
        name: true,
      },
    });
    if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
      await db.accountPayable.create({
        data: {
          description: `Compra de ${product?.name ?? "insumo"}, cfe NF ${invoiceNumber}, de ${customer?.name ?? "cliente"}`,
          amount: totalPrice,
          dueDate: new Date(dueDate),
          companyId,
          customerId,
          purchaseId: purchase.id,
        },
      });
    }

    // Atualiza/insere o estoque da fazenda
    await db.productStock.upsert({
      where: {
        productId_farmId: {
          productId,
          farmId,
        },
      },
      update: {
        stock: {
          increment: quantity,
        },
      },
      create: {
        productId,
        farmId,
        stock: quantity,
        companyId,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar compra de insumo:", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar compra" },
      { status: 500 }
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
      { status: 401 }
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
      { status: 500 }
    );
  }
}
