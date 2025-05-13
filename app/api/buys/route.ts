import { verifyToken } from "@/lib/auth";
import { canCompanyAddPurchase } from "@/lib/permissions/canCompanyAddPurchase";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/buys:
 *   post:
 *     summary: Registrar nova compra
 *     tags:
 *       - Compra
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
 *         description: Colheita criada com sucesso
 */
export async function POST(req: NextRequest) {
  const allowed = await canCompanyAddPurchase();
    if(!allowed) {
      return Response.json(
        {
          error:
            "Limite de registros atingido para seu plano. Faça upgrade para continuar.",
        },
        { status: 403 }
      )
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
    const { cultivarId, date, invoice, unityPrice, totalPrice, customerId, quantityKg, notes } = await req.json();

    if (!cultivarId || !date || !invoice || !quantityKg) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const buys = await db.buy.create({
      data: {
        cultivarId,
        date: new Date(date),
        invoice,
        unityPrice,
        totalPrice,
        customerId,
        quantityKg,
        notes,
        companyId,
      },
    });
    console.log("Atualizando estoque da cultivar:", cultivarId);
    // Atualiza o estoque da cultivar
    await db.cultivar.update({
      where: { id: cultivarId },
      data: {
        stock: {
          increment: quantityKg,
        },
      },
    });

    return NextResponse.json(buys, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar compra:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/buys:
 *   get:
 *     summary: Listar todas as compras da empresa do usuário logado
 *     tags:
 *       - Compra
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
    const buys = await db.buy.findMany({
      where: { companyId },
      include: {
        cultivar:{
          select: { id: true, name: true }
        },
        customer: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(buys, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
