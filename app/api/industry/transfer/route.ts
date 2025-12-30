import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { ProductType } from "@prisma/client";
import { createIndustryTransferSchema } from "@/lib/schemas/industryTransferSchema";
import { withAccessControl } from "@/lib/api/with-access-control";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";

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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl('REGISTER_MOVEMENT');

    const body = await req.json();
    const parsed = createIndustryTransferSchema.parse(body);

    if (parsed.fromDepositId === parsed.toDepositId) {
      return NextResponse.json(
        { 
          error: {
            code: 'INVALID_PAYLOAD',
            title: "Dados inválidos",
            message: 'O depósito de origem e destino devem ser diferentes.'
          }
         },
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
        { 
          error: {
            code: 'INVALID_PAYLOAD',
            title: "Dados inválidos",
            message: 'Estoque de origem não encontrado para esta empresa.'
          }
         },
        { status: 404 },
      );
    }

    if (originStock.quantity.toNumber() < parsed.quantity) {
      return NextResponse.json(
        { 
          error: {
            code: 'INVALID_PAYLOAD',
            title: "Dados inválidos",
            message: 'Estoque insuficiente no depósito de origem.'
          }
         },
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
          companyId: session.user.companyId,
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
    if (error instanceof PlanLimitReachedError) {
          return NextResponse.json(
            { message: error.message },
            { status: 402 }
          )
        }
    
    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { 
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          title: "Erro interno no servidor",
          message: 'Ocorreu um erro ao processar a solicitação, por favor, tente novamente mais tarde.'
        }
       },
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

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const searchParams = req.nextUrl.searchParams;
    const product = searchParams.get("product") as ProductType | undefined;
    const fromDepositId = searchParams.get("fromDepositId") || undefined;
    const toDepositId = searchParams.get("toDepositId") || undefined;
    const cycleId = searchParams.get("cycleId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const transfers = await db.industryTransfer.findMany({
      where: {
        companyId,
        ...(product && { product }),
        ...(fromDepositId && { fromDepositId }),
        ...(toDepositId && { toDepositId }),
        ...(cycleId && { cycleId }),
        ...(startDate && endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        fromDeposit: { select: { id: true, name: true } },
        toDeposit: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: [
        { date: "desc" },
        { document: "desc" },
      ]
    });

    return NextResponse.json(transfers, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transferências de grãos:", error);
    return NextResponse.json(
      { 
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          title: "Erro interno no servidor",
          message: 'Ocorreu um erro ao processar a solicitação, por favor, tente novamente mais tarde.'
        }
       },
      { status: 500 },
    );
  }
}