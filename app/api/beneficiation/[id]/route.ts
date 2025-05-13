import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/beneficiation/{id}:
 *   put:
 *     summary: Atualizar um descarte
 *     tags:
 *       - Descarte
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do descarte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cultivarId:
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
 *         description: Descarte atualizada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Descarte não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Atualizar descarte
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
    const { cultivarId, date, quantityKg, notes } = await req.json();

    // Buscar o descarte para garantir que pertence à empresa do usuário
    const existing = await db.beneficiation.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
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
    const updated = await db.beneficiation.update({
      where: { id },
      data: {
        cultivarId,
        date: new Date(date),
        quantityKg,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}


/**
 * @swagger
 * /api/beneficiation/{id}:
 *   delete:
 *     summary: Deletar um descarte
 *     tags:
 *       - Descarte
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do descarte
 *     responses:
 *       200:
 *         description: Descarte deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Descarte não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Deletar descarte
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

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const existing = await db.beneficiation.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    await adjustStockWhenDeleteMov(
      "descarte",
      existing.cultivarId,
      existing.quantityKg
    );

    const deleted = await db.beneficiation.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Buscar descarte
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

    // Buscar o descarte para garantir que pertence à empresa do usuário
    const descarte = await db.beneficiation.findUnique({ where: { id } });

    if (!descarte || descarte.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(descarte);
  } catch (error) {
    console.error("Erro ao buscar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
