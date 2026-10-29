import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type CycleDependency = {
  label: string;
  count: number;
};

async function getCycleDependencies(
  tx: Prisma.TransactionClient,
  cycleId: string,
): Promise<CycleDependency[]> {
  const [
    talhoes,
    harvests,
    industryHarvests,
    beneficiations,
    consumptions,
    applications,
  ] = await Promise.all([
    tx.cycleTalhao.count({ where: { cycleId } }),
    tx.harvest.count({ where: { cycleId } }),
    tx.industryHarvest.count({ where: { cycleId } }),
    tx.beneficiation.count({ where: { cycleId } }),
    tx.consumptionExit.count({ where: { cycleId } }),
    tx.application.count({ where: { cycleId } }),
  ]);

  return [
    { label: "talhão(ões)", count: talhoes },
    { label: "colheita(s)", count: harvests },
    { label: "colheita(s) de indústria", count: industryHarvests },
    { label: "beneficiamento(s)", count: beneficiations },
    { label: "consumo(s) de sementes", count: consumptions },
    { label: "aplicação(ões) de insumos", count: applications },
  ].filter((dependency) => dependency.count > 0);
}

/**
 * @swagger
 * /api/cycles/{id}:
 *   put:
 *     summary: Atualizar uma safra pelo ID
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safra atualizada com sucesso
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
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  const { id } = params;

  try {
    const { name, productType, startDate, endDate, talhoesIds } =
      await req.json();

    if (!name || !productType || !startDate || !endDate) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_BODY",
            title: "Campos obrigatórios não informados",
            message: "Campos obrigatórios não informados",
          },
        },
        { status: 400 },
      );
    }

    // 1. Verifica se o ciclo existe
    const existingCycle = await db.productionCycle.findUnique({
      where: { id, companyId },
    });

    if (!existingCycle) {
      return NextResponse.json(
        { error: "Safra não encontrada" },
        { status: 404 },
      );
    }

    await db.$transaction(async (tx) => {
      await tx.productionCycle.update({
        where: { id },
        data: {
          name,
          productType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      await tx.cycleTalhao.deleteMany({
        where: { cycleId: id },
      });

      if (Array.isArray(talhoesIds) && talhoesIds.length > 0) {
        await tx.cycleTalhao.createMany({
          data: talhoesIds.map((talhaoId: string) => ({
            cycleId: id,
            talhaoId,
          })),
        });
      }
    });

    const cycleWithTalhoes = await db.productionCycle.findUnique({
      where: { id },
      include: {
        talhoes: {
          include: {
            talhao: true,
          },
        },
      },
    });

    return NextResponse.json(cycleWithTalhoes);
  } catch (error) {
    console.error("Erro ao atualizar safra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar a safra",
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  const { id } = params;

  try {
    const body = await req.json().catch(() => ({}));
    const requestedStatus = body?.status as "OPEN" | "CLOSED" | undefined;

    const cycle = await db.productionCycle.findUnique({
      where: { id },
      select: { id: true, companyId: true, status: true },
    });

    if (!cycle || cycle.companyId !== companyId) {
      return NextResponse.json(
        { error: "Safra não encontrada ou acesso negado" },
        { status: 404 },
      );
    }

    if (
      requestedStatus &&
      requestedStatus !== "OPEN" &&
      requestedStatus !== "CLOSED"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_BODY",
            title: "Status inválido",
            message: "O status deve ser OPEN ou CLOSED.",
          },
        },
        { status: 400 },
      );
    }

    const nextStatus = requestedStatus
      ? requestedStatus
      : cycle.status === "OPEN"
        ? "CLOSED"
        : "OPEN";

    const updated = await db.productionCycle.update({
      where: { id },
      data: { status: nextStatus },
      select: { status: true },
    });

    return NextResponse.json(updated.status);
  } catch (error) {
    console.error("Erro ao atualizar status da safra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar status da safra",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/cycles/{id}:
 *   get:
 *     summary: Listar uma safra pelo ID
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safra retornada com sucesso
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
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const safra = await db.productionCycle.findUnique({
      where: { id },
      include: {
        talhoes: {
          include: {
            talhao: {
              select: {
                id: true,
                name: true,
                area: true,
                farm: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        industryHarvests: true,
      },
    });

    if (!safra || safra.companyId !== companyId) {
      return NextResponse.json(
        { error: "Safra não encontrada ou acesso negado" },
        { status: 404 },
      );
    }

    return NextResponse.json(safra);
  } catch (error) {
    console.error("Erro ao buscar safra:", error);
    return NextResponse.json("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/cycles/{id}:
 *   delete:
 *     summary: Excluir uma safra pelo ID
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safra excluída com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Safra não encontrada
 *       400:
 *         description: Safra possui registros vinculados (talhões ou movimentações)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    // 1. Verifica se o ciclo existe
    const existingCycle = await db.productionCycle.findUnique({
      where: { id },
    });

    if (!existingCycle || existingCycle.companyId !== companyId) {
      return NextResponse.json(
        { error: "Safra não encontrada ou acesso negado" },
        { status: 404 },
      );
    }

    const dependencies = await db.$transaction(
      async (tx): Promise<CycleDependency[]> => {
        const found = await getCycleDependencies(tx, id);

        if (found.length > 0) return found;

        await tx.productionCycle.delete({
          where: { id },
        });

        return [];
      },
    );

    if (dependencies.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "CYCLE_HAS_DEPENDENCIES",
            title: "Exclusão não permitida",
            message: `Não é possível excluir a safra porque existem registros vinculados: ${dependencies
              .map(({ count, label }) => `${count} ${label}`)
              .join(", ")}.`,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Safra excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir safra:", error);
    return NextResponse.json(
      { error: "Erro ao excluir a safra" },
      { status: 500 },
    );
  }
}
