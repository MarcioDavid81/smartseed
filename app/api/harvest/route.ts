import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { withAccessControl } from "@/lib/api/with-access-control";
import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { seedHarvestSchema } from "@/lib/schemas/seedHarvestSchema";
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
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });

    const body = await req.json();

    const parsed = seedHarvestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const cultivar = await db.cultivar.findUnique({
      where: { id: data.cultivarId },
      select: { id: true, name: true, product: true },
    });

    if (!cultivar) {
      return NextResponse.json(
        { error: "Cultivar não encontrada" },
        { status: 404 },
      );
    }

    const talhao = await db.talhao.findUnique({
      where: { id: data.talhaoId },
      select: { id: true, name: true },
    });

    if (!talhao) {
      return NextResponse.json(
        { error: "Talhão não encontrado" },
        { status: 404 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      const harvest = await tx.harvest.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
      });

      // Atualiza o estoque da cultivar
      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: {
            decrement: data.quantityKg,
          },
        },
      });

      return harvest;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colheita:", error);
    if (error instanceof PlanLimitReachedError) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }

    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        },
      },
      { status: 500 },
    );
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
    const harvests = await db.harvest.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        talhao: {
          select: {
            id: true,
            name: true,
            farm: { select: { id: true, name: true } },
          },
        },
        cultivar: {
          select: { id: true, name: true, product: true },
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
