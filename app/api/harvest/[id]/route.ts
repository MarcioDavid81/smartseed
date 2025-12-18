import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
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
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { cultivarId, talhaoId, date, quantityKg, notes } = await req.json();

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const existingHarvest = await db.harvest.findUnique({ where: { id } });

    if (!existingHarvest || existingHarvest.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // Se quantidade ou cultivar mudarem, ajustar o estoque
    if (
      existingHarvest.quantityKg !== quantityKg ||
      existingHarvest.cultivarId !== cultivarId
    ) {
      // Reverter estoque anterior
      await db.cultivar.update({
        where: { id: existingHarvest.cultivarId },
        data: {
          stock: {
            decrement: existingHarvest.quantityKg,
          },
        },
      });

      // Adicionar nova quantidade ao novo cultivar
      await db.cultivar.update({
        where: { id: cultivarId },
        data: {
          stock: {
            increment: quantityKg,
          },
        },
      });
    }

    // Atualizar estoque
    const updatedHarvest = await db.harvest.update({
      where: { id },
      data: {
        cultivarId,
        talhaoId,
        date: new Date(date),
        quantityKg,
        notes,
      },
    });
    return NextResponse.json(updatedHarvest);
  } catch (error) {
    console.error("Erro ao atualizar colheita:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
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
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o colheita para garantir que pertence à empresa do usuário
    const existingHarvest = await db.harvest.findUnique({ where: { id } });

    if (!existingHarvest || existingHarvest.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    await db.$transaction(async (tx) => {
      // Deletar a colheita
      await tx.harvest.delete({ where: { id } });

      // Ajustar o estoque
      await adjustStockWhenDeleteMov(
        tx,
        "Colheita",
        existingHarvest.cultivarId,
        existingHarvest.quantityKg
      );
    });

    return NextResponse.json({ message: "Colheita excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar colheita:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
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
  { params }: { params: { id: string } }
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
