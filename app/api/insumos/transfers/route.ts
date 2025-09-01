import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";

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
const createTransferSchema = z.object({
  date: z.coerce.date(),
  productId: z.string().cuid(),
  quantity: z.number().positive(),
  originFarmId: z.string().uuid(),
  destFarmId: z.string().uuid(),
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

    // valida origem ≠ destino
    if (parsed.originFarmId === parsed.destFarmId) {
      return NextResponse.json(
        { error: "A fazenda de origem e destino devem ser diferentes." },
        { status: 400 },
      );
    }

    // busca estoque origem com filtro de empresa
    const originStock = await db.productStock.findUnique({
      where: {
        productId_farmId: {
          productId: parsed.productId,
          farmId: parsed.originFarmId,
        },
      },
    });

    if (!originStock || originStock.companyId !== companyId) {
      return NextResponse.json(
        { error: "Estoque de origem não encontrado para esta empresa." },
        { status: 404 },
      );
    }

    if (originStock.stock < parsed.quantity) {
      return NextResponse.json(
        { error: "Estoque insuficiente na fazenda de origem." },
        { status: 400 },
      );
    }

    // busca ou cria estoque destino (sempre garantindo companyId)
    let destStock = await db.productStock.findUnique({
      where: {
        productId_farmId: {
          productId: parsed.productId,
          farmId: parsed.destFarmId,
        },
      },
    });

    if (!destStock) {
      destStock = await db.productStock.create({
        data: {
          productId: parsed.productId,
          farmId: parsed.destFarmId,
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
        data: { stock: { decrement: parsed.quantity } },
      });

      await tx.productStock.update({
        where: { id: destStock.id },
        data: { stock: { increment: parsed.quantity } },
      });

      return tx.transferExit.create({
        data: {
          date: parsed.date,
          productId: parsed.productId,
          quantity: parsed.quantity,
          originFarmId: parsed.originFarmId,
          destFarmId: parsed.destFarmId,
          companyId,
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
