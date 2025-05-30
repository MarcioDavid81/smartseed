import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/buys/{id}:
 *   put:
 *     summary: Atualizar uma compra
 *     tags:
 *       - Compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cultivarId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               invoice:
 *                 type: string
 *               unityPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *               quantityKg:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compra atualizada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Compra não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Atualizar compra
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
    const {
      cultivarId,
      date,
      invoice,
      unityPrice,
      totalPrice,
      customerId,
      quantityKg,
      notes,
    } = await req.json();

    // Buscar o compra para garantir que pertence à empresa do usuário
    const existing = await db.buy.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
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
            decrement: existing.quantityKg,
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
    const updated = await db.buy.update({
      where: { id },
      data: {
        cultivarId,
        date: new Date(date),
        invoice,
        unityPrice,
        totalPrice,
        customerId,
        quantityKg,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/buys/{id}:
 *   delete:
 *     summary: Deletar uma compra
 *     tags:
 *       - Compra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da compra
 *     responses:
 *       200:
 *         description: Compra deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Compra não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */

// Deletar compra
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

    // Buscar o compra para garantir que pertence à empresa do usuário
    const existing = await db.buy.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    await adjustStockWhenDeleteMov(
      "compra",
      existing.cultivarId,
      existing.quantityKg
    );

    const deleted = await db.buy.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Buscar compra
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

    // Buscar o compra para garantir que pertence à empresa do usuário
    const compra = await db.buy.findUnique({ where: { id } });

    if (!compra || compra.companyId !== payload.companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(compra);
  } catch (error) {
    console.error("Erro ao buscar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
