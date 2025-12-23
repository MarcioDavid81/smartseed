import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { industryHarvestSchema } from "@/lib/schemas/industryHarvest"; // ⚠️ vamos remover o product daqui
import { ProductType } from "@prisma/client";

/**
 * @swagger
 * /api/industry/harvest:
 *   post:
 *     summary: Registrar nova colheita de produto para indústria
 *     tags:
 *       - Colheita Indústria
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
 *               document:
 *                 type: string
 *               talhaoId:
 *                 type: string
 *               industryDepositId:
 *                 type: string
 *               industryTransporterId:
 *                 type: string
 *               truckPlate:
 *                 type: string
 *               truckDriver:
 *                 type: string
 *               weightBt:
 *                 type: number
 *               weightTr:
 *                 type: number
 *               weightSubLiq:
 *                 type: number
 *               humidity_percent:
 *                 type: number
 *               humidity_discount:
 *                 type: number
 *               humidity_kg:
 *                 type: number
 *               impurities_percent:
 *                 type: number
 *               impurities_discount:
 *                 type: number
 *               impurities_kg:
 *                 type: number
 *               tax_kg:
 *                 type: number
 *               adjust_kg:
 *                 type: number
 *               weightLiq:
 *                 type: number
 *               cycleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Colheita indústria criada com sucesso
 */
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
    const body = await req.json();

    // ✅ product não vem mais do front
    const parsed = industryHarvestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: parsed.error.issues[0].message,
          }
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 🧠 Busca o produto do ciclo
    const cycle = await db.productionCycle.findFirst({
      where: {
        id: data.cycleId,
        companyId, // segurança extra
      },
      select: {
        productType: true,
      },
    });

    if (!cycle) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Ciclo não encontrado",
            message: "O ciclo de produção não foi encontrado ou não pertence à empresa.",
          }
        },
        { status: 404 }
      );
    }

    // 🚀 Cria a colheita com o produto vindo do ciclo
    const industryHarvest = await db.industryHarvest.create({
      data: {
        ...data,
        date: new Date(data.date),
        companyId,
        product: cycle.productType as ProductType, // 🔥 injeta aqui
      },
    });

    // 📦 Atualiza ou cria estoque
    await db.industryStock.upsert({
      where: {
        product_industryDepositId: {
          product: cycle.productType as ProductType, // usa o produto do ciclo
          industryDepositId: data.industryDepositId,
        },
      },
      update: {
        quantity: {
          increment: data.weightLiq,
        },
      },
      create: {
        companyId,
        product: cycle.productType as ProductType, // usa o produto do ciclo
        industryDepositId: data.industryDepositId,
        quantity: data.weightLiq,
      },
    });

    return NextResponse.json(industryHarvest, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colheita:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message: "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        }
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/industry/harvest:
 *   get:
 *     summary: Listar todas as colheitas industriais da empresa do usuário logado
 *     tags:
 *       - Colheita Indústria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: depositId
 *         schema:
 *           type: string
 *         description: Filtrar por depósito de destino
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *           enum: [SOJA, TRIGO, MILHO, AVEIA_PRETA, AVEIA_BRANCA]
 *         description: Filtrar por produto
 *       - in: query
 *         name: cycleId
 *         schema:
 *           type: string
 *         description: Filtrar por safra/ciclo
 *     responses:
 *       200:
 *         description: Lista de colheitas industriais retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - id
 *                   - date
 *                   - talhaoId
 *                   - industryDepositId
 *                   - weightBt
 *                   - weightTr
 *                   - weightSubLiq
 *                   - humidity_percent
 *                   - humidity_discount
 *                   - humidity_kg
 *                   - impurities_percent
 *                   - impurities_discount
 *                   - impurities_kg
 *                   - weightLiq
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   document:
 *                     type: string
 *                   talhaoId:
 *                     type: string
 *                   industryDepositId:
 *                     type: string
 *                   industryTransporterId:
 *                     type: string
 *                   truckPlate:
 *                     type: string
 *                   truckDriver:
 *                     type: string
 *                   weightBt:
 *                     type: number
 *                   weightTr:
 *                     type: number
 *                   weightSubLiq:
 *                     type: number
 *                   humidity_percent:
 *                     type: number
 *                   humidity_discount:
 *                     type: number
 *                   humidity_kg:
 *                     type: number
 *                   impurities_percent:
 *                     type: number
 *                   impurities_discount:
 *                     type: number
 *                   impurities_kg:
 *                     type: number
 *                   tax_kg:
 *                     type: number
 *                   adjust_kg:
 *                     type: number
 *                   weightLiq:
 *                     type: number
 *                   product:
 *                     type: string
 *                     description: Produto inferido do ciclo (SOJA/TRIGO/MILHO/AVEIA_PRETA/AVEIA_BRANCA)
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

  const { searchParams } = new URL(req.url);
  const depositId = searchParams.get("depositId");
  const product = searchParams.get("product");
  const cycleId = searchParams.get("cycleId");

  try {
    const industryHarvests = await db.industryHarvest.findMany({
      where: {
        companyId: payload.companyId,
        ...(depositId ? { industryDepositId: depositId } : {}),
        ...(product ? { product: product as ProductType } : {}),
        ...(cycleId ? { cycleId } : {}),
      },
      include: {
        industryDeposit: true,
        industryTransporter: {
          select: {
            name: true,
          },
        },
        talhao: {
          select: {
            name: true,
            farm: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: "desc" }, { document: "desc" }],
    });

    return NextResponse.json(industryHarvests);
  } catch (error) {
    console.error("Erro ao buscar colheitas:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message: "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        }
      },
      { status: 500 },
    );
  }
}
