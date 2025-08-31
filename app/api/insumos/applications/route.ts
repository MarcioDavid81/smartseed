import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";

/**
 * @swagger
 * /api/insumos/applications:
 *   post:
 *     summary: Registrar nova aplicação de insumos
 *     tags:
 *       - Aplicação de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productStockId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               talhaoId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aplicação de insumo criada com sucesso
 */
const createApplicationSchema = z.object({
  productStockId: z.string().cuid(),
  quantity: z.number().positive(),
  talhaoId: z.string().cuid(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  companyId: z.string().uuid(),
  cycleId: z.string().cuid().optional(),
});

export async function POST(req: NextRequest) {
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
    const { productStockId, quantity, talhaoId, date, notes, cycleId } =
      await req.json();
    const data = createApplicationSchema.parse({
      productStockId,
      quantity,
      talhaoId,
      date,
      notes,
      cycleId,
      companyId,
    });

    // pega o estoque
    const stock = await db.productStock.findUnique({
      where: { id: data.productStockId },
    });

    if (!stock) {
      return NextResponse.json(
        { error: "Estoque não encontrado para este insumo." },
        { status: 404 },
      );
    }

    if (stock.stock < data.quantity) {
      return NextResponse.json(
        {
          error: `Estoque insuficiente. Disponível: ${stock.stock}, solicitado: ${data.quantity}.`,
        },
        { status: 400 },
      );
    }

    // transação: cria aplicação e atualiza estoque
    const [application] = await db.$transaction([
      db.application.create({
        data: {
          productStockId: data.productStockId,
          quantity: data.quantity,
          date: data.date,
          notes: data.notes,
          companyId: data.companyId,
          cycleId: data.cycleId,
          talhaoId: data.talhaoId,
        },
        include: {
          productStock: {
            include: {
              product: true,
              farm: true,
            },
          },
          talhao: true,
        },
      }),
      db.productStock.update({
        where: { id: data.productStockId },
        data: { stock: stock.stock - data.quantity },
      }),
    ]);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao registrar aplicação." },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/insumos/applications:
 *   get:
 *     summary: Listar todas as aplicações de insumos da empresa do usuário logado
 *     tags:
 *       - Aplicação de Insumos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de aplicações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   productStockId:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   quantity:
 *                     type: number
 *                   talhaoId:
 *                     type: string
 *                   notes:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
const querySchema = z.object({
  farmId: z.string().cuid().optional(),
  talhaoId: z.string().cuid().optional(),
  cycleId: z.string().cuid().optional(),
});

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
    const query = Object.fromEntries(searchParams.entries());
    const filters = querySchema.parse(query);

    const applications = await db.application.findMany({
      where: {
        companyId,
        ...(filters.farmId && {
          productStock: { farmId: filters.farmId },
        }),
        ...(filters.talhaoId && { talhaoId: filters.talhaoId }),
        ...(filters.cycleId && { cycleId: filters.cycleId }),
      },
      include: {
        productStock: {
          include: {
            product: true,
            farm: true,
          },
        },
        talhao: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar aplicações." },
      { status: 500 },
    );
  }
}
