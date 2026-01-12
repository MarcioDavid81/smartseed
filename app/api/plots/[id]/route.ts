import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { plotSchema } from "@/lib/schemas/plotSchema";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/plots/{id}:
 *   put:
 *     summary: Atualizar talhão
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
 *     responses:
 *       200:
 *         description: Talhão atualizado com sucesso
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const { companyId } = auth;
    const { name, area, farmId } = await req.json();
    const { id } = params;

    // 1️⃣ Buscar talhão atual
    const currentPlot = await db.talhao.findUnique({
      where: { id, companyId },
      select: {
        id: true,
        area: true,
        farmId: true,
      },
    });

    if (!currentPlot) {
      return NextResponse.json(
        {
          code: "PLOT_NOT_FOUND",
          title: "Talhão não encontrado",
          message: "O talhão informado não foi encontrado.",
        },
        { status: 404 },
      );
    }

    // 2️⃣ Atualizar talhão
    const updatedPlot = await db.talhao.update({
      where: { id, companyId },
      data: {
        name,
        area,
        farmId,
      },
    });

    // 3️⃣ Fazendas afetadas
    const affectedFarmIds = new Set<string>([currentPlot.farmId, farmId]);

    // 4️⃣ Recalcular área das fazendas afetadas
    Array.from(affectedFarmIds).forEach(async (affectedFarmId) => {
      const result = await db.talhao.aggregate({
        where: {
          farmId: affectedFarmId,
          companyId,
        },
        _sum: {
          area: true,
        },
      });

      await db.farm.update({
        where: {
          id: affectedFarmId,
          companyId,
        },
        data: {
          area: result._sum.area ?? 0,
        },
      });
    });

    return NextResponse.json(updatedPlot, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar talhão:", error);
    return NextResponse.json(
      {
        code: "PLOT_UPDATE_ERROR",
        title: "Erro ao atualizar talhão",
        message:
          "Ocorreu um erro ao atualizar o talhão. Por favor, tente novamente.",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/plots/{id}:
 *   delete:
 *     summary: Deletar um talhão
 *     tags:
 *       - Talhão
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do talhão
 *     responses:
 *       200:
 *         description: Talhão deletado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Talhão não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
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

    const [activeCycleLinks, totalCycleLinks] = await Promise.all([
      db.cycleTalhao.count({
        where: { talhaoId: id, cycle: { isActive: true } },
      }),
      db.cycleTalhao.count({ where: { talhaoId: id } }),
    ]);

    if (totalCycleLinks > 0) {
      return NextResponse.json(
        {
          error:
            "Este talhão está vinculado a um ou mais ciclos e não pode ser deletado.",
          details: {
            activeCycleLinks,
            totalCycleLinks,
          },
          action:
            "Remova o vínculo do talhão nos ciclos (CycleTalhao) antes de deletar.",
        },
        { status: 409 },
      );
    }

    const [
      harvestCount,
      applicationCount,
      consumptionCount,
      industryHarvestCount,
    ] = await Promise.all([
      db.harvest.count({ where: { talhaoId: id } }),
      db.application.count({ where: { talhaoId: id } }),
      db.consumptionExit.count({ where: { talhaoId: id } }),
      db.industryHarvest.count({ where: { talhaoId: id } }),
    ]);

    const totalMovements =
      harvestCount + applicationCount + consumptionCount + industryHarvestCount;
    if (totalMovements > 0) {
      return NextResponse.json(
        {
          error:
            "Este talhão possui movimentações (colheita, aplicação ou consumo) e não pode ser deletado.",
          details: {
            harvests: harvestCount,
            applications: applicationCount,
            consumptions: consumptionCount,
            industryHarvests: industryHarvestCount,
          },
        },
        { status: 409 },
      );
    }

    const finalResult = await db.$transaction(async (tx) => {
      // 1️⃣ Buscar talhão ANTES de deletar
      const plot = await tx.talhao.findUnique({
        where: { id, companyId },
        select: {
          id: true,
          farmId: true,
        },
      });

      if (!plot) {
        return NextResponse.json(
          {
            code: "PLOT_NOT_FOUND",
            title: "Talhão não encontrado",
            message: "O talhão informado não foi encontrado.",
          },
          { status: 404 },
        );
      }

      // 2️⃣ Deletar talhão
      const deletedPlot = await tx.talhao.delete({
        where: { id, companyId },
      });

      // 3️⃣ Recalcular área da fazenda
      const result = await tx.talhao.aggregate({
        where: {
          farmId: plot.farmId,
          companyId,
        },
        _sum: {
          area: true,
        },
      });

      // 4️⃣ Atualizar fazenda (agora com segurança)
      await tx.farm.update({
        where: {
          id: plot.farmId,
          companyId,
        },
        data: {
          area: result._sum.area ?? 0,
        },
      });

      return deletedPlot;
    });

    return NextResponse.json(finalResult, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar talhão:", error);
    return NextResponse.json(
      {
        code: "PLOT_DELETE_ERROR",
        title: "Erro ao deletar talhão",
        message:
          "Ocorreu um erro ao deletar o talhão. Por favor, tente novamente.",
      },
      { status: 500 },
    );
  }
}
