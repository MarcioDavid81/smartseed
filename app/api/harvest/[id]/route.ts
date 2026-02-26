import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { assertCycleIsOpen } from "@/app/_helpers/assert-cycle-open";
import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/harvest/{id}:
 *   put:
 *     summary: Atualizar uma colheita
 *     tags:
 *       - Colheita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da colheita
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
 *         description: Colheita atualizada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Colheita não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */

// Atualizar colheita
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const companyId = auth.companyId;

    const { id } = params;
    const { cultivarId, talhaoId, date, quantityKg, notes } = await req.json();

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const existingHarvest = await db.harvest.findUnique({ where: { id } });

    if (!existingHarvest || existingHarvest.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "HARVEST_NOT_FOUND",
            title: "Colheita não encontrada",
            message:
              "A colheita não foi localizada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      const harvest = await tx.harvest.findUnique({
        where: { id },
        select: {
          cultivarId: true,
          quantityKg: true,
          cycleId: true,
        },
      });
      if (!harvest) throw new Error("Colheita não encontrada");
      // Verificar se a safra está aberta
      await assertCycleIsOpen(tx, harvest?.cycleId || "", companyId);

      const delta = Number(quantityKg) - Number(harvest.quantityKg);
      if (delta !== 0 || cultivarId !== harvest.cultivarId) {
        // Reverter estoque anterior
        await tx.cultivar.update({
          where: { id: harvest.cultivarId },
          data: {
            stock: {
              decrement: harvest.quantityKg,
            },
          },
        });
        // Adicionar nova quantidade ao novo cultivar
        await tx.cultivar.update({
          where: { id: cultivarId },
          data: {
            stock: {
              increment: quantityKg,
            },
          },
        });
      };

      // Atualizar colheita
      await tx.harvest.update({
        where: { id },
        data: {
          cultivarId,
          talhaoId,
          date: new Date(date),
          quantityKg,
          notes,
        },
      });

      return harvest;

    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao atualizar colheita:", error);

    return NextResponse.json(
      {
        error: error.message ?? "Erro interno no servidor",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/harvest/{id}:
 *   delete:
 *     summary: Deletar uma colheita
 *     tags:
 *       - Colheita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da colheita
 *     responses:
 *       200:
 *         description: Colheita deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Colheita não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Deletar colheita
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const existingHarvest = await db.harvest.findUnique({ where: { id } });

    if (!existingHarvest || existingHarvest.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "HARVEST_NOT_FOUND",
            title: "Colheita não encontrada",
            message:
              "A colheita não foi localizada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    await db.$transaction(async (tx) => {
      const harvest = await tx.harvest.findUnique({
        where: { id },
        select: {
          cultivarId: true,
          quantityKg: true,
          cycleId: true,
        },
      })
      if (!harvest) throw new Error("Colheita não encontrada");

      // Verificar se a safra está aberta
      await assertCycleIsOpen(tx, harvest?.cycleId || "", companyId);

      // Reverter estoque da cultivar (decrementar)
      await tx.cultivar.update({
        where: { id: harvest.cultivarId },
        data: {
          stock: {
            decrement: harvest.quantityKg,
          },
        },
      });
      // Deletar a colheita
      await tx.harvest.delete({ where: { id } });
    });
    return NextResponse.json({ message: "Colheita excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar colheita:", error);
    return NextResponse.json(
      {
        error: error.message ?? "Erro interno no servidor",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/harvest/{id}:
 *   get:
 *     summary: Buscar uma colheita por ID
 *     tags:
 *       - Colheita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da colheita
 *     responses:
 *       200:
 *         description: Colheita retornada com sucesso
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
// Buscar colheita
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const colheita = await db.harvest.findUnique({ where: { id } });

    if (!colheita || colheita.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(colheita);
  } catch (error) {
    console.error("Erro ao buscar colheita:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
