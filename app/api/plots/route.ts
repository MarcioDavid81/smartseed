import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { plotSchema } from "@/lib/schemas/plotSchema";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/plots:
 *   post:
 *     summary: Registrar novo talhão
 *     tags:
 *       - Talhão
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
 *               area:
 *                 type: number
 *               farmId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Talhão criado com sucesso
 */

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl("CREATE_MASTER_DATA");

    const body = await req.json();

    const parsed = plotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Cria o talhão
      const createdPlot = await tx.talhao.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
      });

      // 2️⃣ Atualiza a área da fazenda
      await tx.farm.update({
        where: { id: data.farmId },
        data: {
          area: {
            increment: data.area,
          },
        },
      });
      return createdPlot;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar talhão:", error);
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
 * /api/plots:
 *   get:
 *     summary: Listar todas os talhões da empresa do usuário logado
 *     tags:
 *       - Talhão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de talhões retornada com sucesso
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
 *                   farmId:
 *                     type: string
 *                   farm:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *       401:
 *         description: Token ausente ou inválido
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    const plots = await db.talhao.findMany({
      where: { companyId },
      include: { farm: { select: { id: true, name: true } } },
      orderBy: { farm: { name: "asc" } },
    });

    return NextResponse.json(plots, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar talhões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
