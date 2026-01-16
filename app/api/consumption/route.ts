import { validateStock } from "@/app/_helpers/validateStock";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { consumptionSchema } from "@/lib/schemas/seedConsumption";
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
 *               talhaoId:
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
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });

    const body = await req.json();

    const parsed = consumptionSchema.safeParse(body);

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

    const stockValidation = await validateStock(
      data.cultivarId,
      data.quantityKg,
    );
    if (stockValidation) return stockValidation;

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
        { error: "Talhão não encontrada" },
        { status: 404 },
      );
    }

    // 🔄 Tudo dentro de uma transação para garantir integridade
    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Cria o registro do consumo
      const consumption = await tx.consumptionExit.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
      });

      // 2️⃣ Atualiza o estoque da cultivar (decrementa)
      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: { decrement: data.quantityKg },
        },
      });

      return consumption;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar consumo:", error);
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
 *                   talhaoId:
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
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  const cycleId = req.nextUrl.searchParams.get("cycleId");

  try {
    const consumptions = await db.consumptionExit.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        cultivar: {
          select: { id: true, name: true },
        },
        talhao: {
          select: {
            id: true,
            name: true,
            area: true,
            farm: {
              select: { id: true, name: true },
            },
          },
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
