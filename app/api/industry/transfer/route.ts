import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { ProductType } from "@prisma/client";

/**
 * @swagger
 * /api/industry/transfer:
 *   post:
 *     summary: Registrar nova transferência de grãos entre depósitos
 *     tags:
 *       - Transferência de Grãos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               product:
 *                 type: ProductType
 *               fromDepositId:
 *                 type: string
 *               toDepositId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               document:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transferência de grão criada com sucesso
 */
const createTransferSchema = z.object({
  date: z.coerce.date(),
  product: z.nativeEnum(ProductType),
  fromDepositId: z.string().cuid(),
  toDepositId: z.string().cuid(),
  quantity: z.number().positive(),
  document: z.string().optional(),
  observation: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não informado" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { companyId } = payload;
    const body = await req.json();
    const parsed = createTransferSchema.parse(body);

    if (parsed.fromDepositId === parsed.toDepositId) {
      return NextResponse.json(
        { error: "O depósito de origem e destino devem ser diferentes." },
        { status: 400 },
      );
    }

    const originStock = await db.industryStock.findUnique({
      where: {
        product_industryDepositId: {
          product: parsed.product,
          industryDepositId: parsed.fromDepositId,
        },
      },
    });

    if (!originStock || originStock.companyId !== companyId) {
      return NextResponse.json(
        { error: "Estoque de origem não encontrado para esta empresa." },
        { status: 404 },
      );
    }

    if (originStock.quantity.toNumber() < parsed.quantity) {
      return NextResponse.json(
        { error: "Estoque insuficiente no depósito de origem." },
        { status: 400 },
      );
    }

    const transfer = await db.$transaction(async (tx) => {
      await tx.industryStock.update({
        where: { id: originStock.id },
        data: { quantity: { decrement: parsed.quantity } },
      });

      let destStock = await tx.industryStock.findUnique({
        where: {
          product_industryDepositId: {
            product: parsed.product,
            industryDepositId: parsed.toDepositId,
          },
        },
      });

      if (!destStock) {
        destStock = await tx.industryStock.create({
          data: {
            product: parsed.product,
            industryDepositId: parsed.toDepositId,
            companyId,
            quantity: 0,
          },
        });
      }

      await tx.industryStock.update({
        where: { id: destStock.id },
        data: { quantity: { increment: parsed.quantity } },
      });

      return tx.industryTransfer.create({
        data: {
          date: parsed.date,
          product: parsed.product,
          quantity: parsed.quantity,
          fromDepositId: parsed.fromDepositId,
          toDepositId: parsed.toDepositId,
          document: parsed.document,
          observation: parsed.observation,
          companyId,
        },
        include: {
          fromDeposit: { select: { id: true, name: true } },
          toDeposit: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/industry/transfer:
 *   get:
 *     summary: Listar transferências de grãos entre depósitos
 *     tags:
 *       - Transferência de Grãos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *           enum: [SOJA, TRIGO, MILHO]
 *         description: Filtrar por tipo de produto
 *       - in: query
 *         name: fromDepositId
 *         schema:
 *           type: string
 *         description: Filtrar por depósito de origem
 *       - in: query
 *         name: toDepositId
 *         schema:
 *           type: string
 *         description: Filtrar por depósito de destino
 *       - in: query
 *         name: cycleId
 *         schema:
 *           type: string
 *         description: Filtrar por ciclo de produção
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Lista de transferências de grãos
 */
const querySchema = z.object({
  product: z.nativeEnum(ProductType).optional(),
  fromDepositId: z.string().cuid().optional(),
  toDepositId: z.string().cuid().optional(),
  cycleId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não informado" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { companyId } = payload;

    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = querySchema.parse(searchParams);

    const transfers = await db.industryTransfer.findMany({
      where: {
        companyId,
        ...(parsed.product && { product: parsed.product }),
        ...(parsed.fromDepositId && { fromDepositId: parsed.fromDepositId }),
        ...(parsed.toDepositId && { toDepositId: parsed.toDepositId }),
        ...(parsed.cycleId && { cycleId: parsed.cycleId }),
        ...(parsed.startDate &&
          parsed.endDate && {
            date: {
              gte: parsed.startDate,
              lte: parsed.endDate,
            },
          }),
      },
      include: {
        fromDeposit: { select: { id: true, name: true } },
        toDeposit: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transfers, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}