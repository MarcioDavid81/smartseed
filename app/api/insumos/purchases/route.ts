import { verifyToken } from "@/lib/auth";
import { canCompanyAddPurchase } from "@/lib/permissions/canCompanyAddPurchase";
import { db } from "@/lib/prisma";
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
 *               unit:
 *                 type: string
 *               farmId:
 *                 type: string
 *               cycleId:
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
      unit,
      farmId,
      cycleId,
      notes,
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
        unit,
        farmId,
        cycleId,
        notes,
        companyId,
        type: "COMPRA", // vem do enum InsumoOperationType
      },
    });

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
 *     summary: Listar compras de insumos
 *     tags:
 *       - Compra de Insumos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: farmId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: cycleId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: productId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de compras de insumos
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
    const cycleId = searchParams.get("cycleId");
    const productId = searchParams.get("productId");

    const purchases = await db.purchase.findMany({
      where: {
        companyId,
        ...(farmId ? { farmId } : {}),
        ...(cycleId ? { cycleId } : {}),
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
