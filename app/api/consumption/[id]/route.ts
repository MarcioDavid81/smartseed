import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/consumption/{id}:
 *   put:
 *     summary: Atualizar um consumo
 *     tags:
 *       - Consumo/Plantio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do consumo
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
 *         description: Consumo atualizado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Consumo não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Atualizar plantio
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
    const { cultivarId, date, quantityKg, farmId, notes } = await req.json();

    // Buscar o plantio para garantir que pertence à empresa do usuário
    const existing = await db.consumptionExit.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Plantio não encontrado ou acesso negado", {
        status: 403,
      });
    }

    // Se quantidade ou cultivar mudarem, ajustar o estoque
    if (
      existing.quantityKg !== quantityKg ||
      existing.cultivarId !== cultivarId
    ) {
      // Reverter estoque anterior
      await db.cultivar.update({
        where: { id: existing.cultivarId },
        data: {
          stock: {
            increment: existing.quantityKg,
          },
        },
      });

      // Subtrair nova quantidade ao novo cultivar
      await db.cultivar.update({
        where: { id: cultivarId },
        data: {
          stock: {
            decrement: quantityKg,
          },
        },
      });
    }

    // Atualizar estoque
    const updated = await db.consumptionExit.update({
      where: { id },
      data: {
        cultivarId,
        date: new Date(date),
        quantityKg,
        farmId,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar plantio:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/consumption/{id}:
 *   delete:
 *     summary: Deletar um consumo
 *     tags:
 *       - Consumo/Plantio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do consumo
 *     responses:
 *       200:
 *         description: Consumo deletado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Consumo não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */

// Deletar plantio
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

    // Buscar o plantio para garantir que pertence à empresa do usuário
    const existing = await db.consumptionExit.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Plantio não encontrado ou acesso negado", {
        status: 403,
      });
    }

    await adjustStockWhenDeleteMov(
      "plantio",
      existing.cultivarId,
      existing.quantityKg
    );

    const deleted = await db.consumptionExit.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar plantio:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Buscar plantio
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

    // Buscar o plantio para garantir que pertence à empresa do usuário
    const plantio = await db.consumptionExit.findUnique({ where: { id } });

    if (!plantio || plantio.companyId !== payload.companyId) {
      return new NextResponse("Plantio não encontrado ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(plantio);
  } catch (error) {
    console.error("Erro ao buscar plantio:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
