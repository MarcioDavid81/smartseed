import { validateStock } from "@/app/_helpers/validateStock";
import { verifyToken } from "@/lib/auth";
import { canCompanyAddConsumption } from "@/lib/permissions/canCompanyAddConsumption";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/consumption:
 *   post:
 *     summary: Registrar novo consumo
 *     tags:
 *       - Consumo/Plantio
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
 *               farmId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantityKg:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consumo criado com sucesso
 */
export async function POST(req: NextRequest) {
  const allowed = await canCompanyAddConsumption();
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
    const { cultivarId, date, quantityKg, farmId, notes } = await req.json();

    if (!cultivarId || !date || !quantityKg || !farmId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const stockValidation = await validateStock(cultivarId, quantityKg);
    if (stockValidation) return stockValidation;

    const consumptions = await db.consumptionExit.create({
      data: {
        cultivarId,
        date: new Date(date),
        quantityKg,
        farmId,
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
          decrement: quantityKg,
        },
      },
    });

    return NextResponse.json(consumptions, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar consumo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/consumption:
 *   get:
 *     summary: Listar todos os consumos da empresa do usuário logado
 *     tags:
 *       - Consumo/Plantio
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consumos retornada com sucesso
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
 *                   farmId:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
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
    const consumptions = await db.consumptionExit.findMany({
      where: { companyId },
      include: {
        cultivar: {
          select: { id: true, name: true },
        },
        farm: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(consumptions, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar consumos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
