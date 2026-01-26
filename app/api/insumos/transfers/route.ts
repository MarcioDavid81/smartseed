import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { inputTransferSchema } from "@/lib/schemas/inputSchema";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";

/**
 * @swagger
 * /api/insumos/transfers:
 *   post:
 *     summary: Registrar nova transferência de insumos
 *     tags:
 *       - Transferência de Insumos
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
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               originFarmId:
 *                 type: string
 *               destFarmId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transferência de insumo criada com sucesso
 */

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl('REGISTER_MOVEMENT');

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });

    const body = await req.json();
    const parsed = inputTransferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // valida origem ≠ destino
    if (data.originFarmId === data.destFarmId) {
      return NextResponse.json(
        { error: "A fazenda de origem e destino devem ser diferentes." },
        { status: 400 },
      );
    }

    // busca estoque origem com filtro de empresa
    const originStock = await db.productStock.findUnique({
      where: {
        productId_farmId: {
          productId: data.productId,
          farmId: data.originFarmId,
        },
      },
    });

    if (!originStock || originStock.companyId !== companyId) {
      return NextResponse.json(
        { error: "Estoque de origem não encontrado para esta empresa." },
        { status: 404 },
      );
    }

    if (originStock.stock < data.quantity) {
      return NextResponse.json(
        { error: "Estoque insuficiente na fazenda de origem." },
        { status: 400 },
      );
    }

    // busca ou cria estoque destino (sempre garantindo companyId)
    let destStock = await db.productStock.findUnique({
      where: {
        productId_farmId: {
          productId: data.productId,
          farmId: data.destFarmId,
        },
      },
    });

    if (!destStock) {
      destStock = await db.productStock.create({
        data: {
          productId: data.productId,
          farmId: data.destFarmId,
          companyId,
          stock: 0,
        },
      });
    }

    if (destStock.companyId !== companyId) {
      return NextResponse.json(
        { error: "Estoque de destino não pertence a esta empresa." },
        { status: 403 },
      );
    }

    // transação: debita origem, credita destino e registra transferência
    const transfer = await db.$transaction(async (tx) => {
      await tx.productStock.update({
        where: { id: originStock.id },
        data: { stock: { decrement: data.quantity } },
      });

      await tx.productStock.update({
        where: { id: destStock.id },
        data: { stock: { increment: data.quantity } },
      });

      return tx.transferExit.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
        include: {
          product: { select: { id: true, name: true, unit: true } },
          originFarm: { select: { id: true, name: true } },
          destFarm: { select: { id: true, name: true } },
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
 * /api/insumos/transfers:
 *   get:
 *     summary: Listar todas as transferências de insumos da empresa do usuário logado
 *     tags:
 *       - Transferência de Insumos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transferências retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   productId:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   originFarmId:
 *                     type: string
 *                   destFarmId:
 *                     type: string
 *       201:
 *         description: Transferências de insumos retornadas com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       500:
 *         description: Erro interno no servidor
 */
const querySchema = z.object({
  farmId: z.string().cuid().optional(),      // origem OU destino
  productId: z.string().cuid().optional(),
  cycleId: z.string().cuid().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token não informado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { companyId } = payload;

    // parse query params
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.parse(query);

    const transfers = await db.transferExit.findMany({
      where: {
        companyId,
        ...(parsed.productId && { productId: parsed.productId }),
        ...(parsed.cycleId && { cycleId: parsed.cycleId }),
        ...(parsed.farmId && {
          OR: [
            { originFarmId: parsed.farmId },
            { destFarmId: parsed.farmId },
          ],
        }),
      },
      orderBy: { date: "desc" },
      include: {
        product: { select: { id: true, name: true, unit: true } },
        originFarm: { select: { id: true, name: true } },
        destFarm: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(transfers, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao buscar transferências" },
      { status: 500 }
    );
  }
}
