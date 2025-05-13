import { verifyToken } from "@/lib/auth";
import { canCompanyAddHarvest } from "@/lib/permissions/canCompanyAddHarvest";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/harvest:
 *   post:
 *     summary: Registrar nova colheita
 *     tags:
 *       - Colheita
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
 *               talhaoId:
 *                 type: string
 *               quantityKg:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Colheita criada com sucesso
 */
export async function POST(req: NextRequest) {
  const allowed = await canCompanyAddHarvest();
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
    const { cultivarId, talhaoId, date, quantityKg, notes } = await req.json();

    if (!cultivarId || !talhaoId || !date || !quantityKg) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const harvest = await db.harvest.create({
      data: {
        cultivarId,
        talhaoId,
        date: new Date(date),
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

    return NextResponse.json(harvest, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colheita:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/harvest:
 *   get:
 *     summary: Listar todas as colheitas da empresa do usuário logado
 *     tags:
 *       - Colheita
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de colheitas retornada com sucesso
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
 *                   talhaoId:
 *                     type: string
 *                   quantityKg:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date
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
    const harvests = await db.harvest.findMany({
      where: { companyId },
      include: {
        talhao: {
          select: { id: true, name: true, farm: { select: { id: true, name: true } } },
        },
        cultivar: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(harvests, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar colheitas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
