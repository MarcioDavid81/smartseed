import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { farmSchema } from "@/lib/schemas/farmSchema";
import { dataTagErrorSymbol } from "@tanstack/react-query";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Registrar nova fazenda
 *     tags:
 *       - Fazenda
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
 *     responses:
 *       200:
 *         description: Fazenda criada com sucesso
 */
export async function POST(req: NextRequest) {
  
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl('CREATE_MASTER_DATA');

    const body = await req.json();
    const { name } = farmSchema.parse(body);

    if (!name) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: "O nome do depósito é obrigatório.",
          },
        },
        { status: 400 },
      );
    }

    const farm = await db.farm.create({
      data: {
        name,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fazenda:", error);
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
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Listar todas as fazendas da empresa do usuário logado
 *     tags:
 *       - Fazenda
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fazendas retornada com sucesso
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
 *                   talhoes:
 *                     type: array
 *                     items:
 *                       type: object
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
    const farms = await db.farm.findMany({
      where: { companyId },
      include: { talhoes: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(farms, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar fazendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
