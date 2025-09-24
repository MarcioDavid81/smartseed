import { validateStock } from "@/app/_helpers/validateStock";
import { verifyToken } from "@/lib/auth";
import { canCompanyAddSale } from "@/lib/permissions/canCompanyAddSale";
import { db } from "@/lib/prisma";
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
  const allowed = await canCompanyAddSale();
  if (!allowed) {
    return Response.json(
      {
        error:
          "Limite de registros atingido para seu plano. Faça upgrade para continuar.",
      },
      { status: 403 },
    );
  }

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
    const {
      cultivarId,
      date,
      quantityKg,
      customerId,
      invoiceNumber,
      saleValue,
      notes,
      cycleId,
      paymentCondition,
      dueDate,
    } = await req.json();

    if (!cultivarId || !date || !quantityKg || !companyId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    if (!cultivarId || !date || !quantityKg) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    const stockValidation = await validateStock(cultivarId, quantityKg);
    if (stockValidation) return stockValidation;

    const sales = await db.saleExit.create({
      data: {
        cultivarId,
        date: new Date(date),
        quantityKg: Number(quantityKg),
        customerId,
        invoiceNumber,
        saleValue,
        notes,
        companyId,
        cycleId,
        paymentCondition,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    //Se for a prazo → cria conta a receber
    if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
      await db.accountReceivable.create({
        data: {
          description: `Venda de semente - NF ${invoiceNumber}`,
          amount: saleValue,
          dueDate: new Date(dueDate),
          companyId,
          customerId,
          saleExitId: sales.id,
        },
      });
    }
    console.log("Atualizando estoque da cultivar:", cultivarId);
    // Atualiza o estoque da cultivar
    await db.cultivar.update({
      where: { id: cultivarId },
      data: {
        stock: {
          decrement: quantityKg,
        },
      },
    });

    return NextResponse.json(sales, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
