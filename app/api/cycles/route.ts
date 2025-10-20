import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/cycles:
 *   post:
 *     summary: Registrar nova safra
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Safra criada com sucesso
 */

export async function POST(req: NextRequest) {
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
    const { name, productType, startDate, endDate, talhoesIds } = await req.json();

    if (!name || !productType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // 1. Cria o ciclo
    const cycle = await db.productionCycle.create({
      data: {
        name,
        productType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
      },
    });

    // 2. Se tiver talhões, cria os relacionamentos na tabela intermediária
    if (talhoesIds && talhoesIds.length > 0) {
      await db.cycleTalhao.createMany({
        data: talhoesIds.map((talhaoId: string) => ({
          cycleId: cycle.id,
          talhaoId,
        })),
      });
    }

    // 3. Retorna o ciclo com os talhões relacionados
    const cycleWithTalhoes = await db.productionCycle.findUnique({
      where: { id: cycle.id },
      include: {
        talhoes: {
          include: {
            talhao: true,
          },
        },
      },
    });

    return NextResponse.json(cycleWithTalhoes, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar safra:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/cycles:
 *   get:
 *     summary: Listar todas as safras da empresa do usuário logado
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de safras retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
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
    const cycles = await db.productionCycle.findMany({
      where: { companyId },
      include: {
        talhoes: {
          include: {
            talhao: {
              select: {
                id: true,
                name: true,
                area: true,
              }
            },
          },
        },
        harvests: true,
        buys: true,
        beneficiations: true,
        consumptionsExit: true,
        salesExit: true,
        purchases: true,
        transfers: true,
        applications: true,
        industryHarvests: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cycles, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar ciclos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}