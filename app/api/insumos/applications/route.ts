import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { inputApplicationSchema } from "@/lib/schemas/inputSchema";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";

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

    const parsed = inputApplicationSchema.safeParse(body);

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

    const data = parsed.data;;

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
    const result = await db.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          ...data,
          companyId: session.user.companyId,
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
      });

      // Atualiza o estoque
      await tx.productStock.update({
        where: { id: data.productStockId },
        data: { stock: { decrement: data.quantity } },
      });

      return application;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aplicação:", error);
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
 *       201:
 *         description: Aplicações de insumos retornadas com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       500:
 *         description: Erro interno no servidor
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
