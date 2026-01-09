import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";

/**
 * @swagger
 * /api/buys/{id}:
 *   put:
 *     summary: Atualizar uma compra de semente
 *     tags:
 *       - Compra de Semente
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
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

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
      paymentCondition,
      dueDate,
    } = await req.json();

    // Buscar o compra para garantir que pertence à empresa do usuário
    const existing = await db.buy.findUnique({
      where: { id },
      include: { accountPayable: true },
    });

    if (!existing || existing.companyId !== companyId) {
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

    // Atualizar compra
    const updatedBuy = await db.buy.update({
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
        paymentCondition,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    // Sincronizar AccountPayable
    if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
      const cultivar = await db.cultivar.findUnique({
        where: { id: cultivarId },
        select: {
          name: true,
        },
      });
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        select: {
          name: true,
        },
      });
      if (existing.accountPayable) {
        // Atualiza conta existente
        await db.accountPayable.update({
          where: { id: existing.accountPayable.id },
          data: {
            description: `Compra de ${cultivar?.name ?? "semente"}, cfe NF ${invoice}, de ${customer?.name ?? "cliente"}`,
            amount: totalPrice,
            dueDate: new Date(dueDate),
            customerId,
          },
        });
      } else {
        // Cria nova conta
        await db.accountPayable.create({
          data: {
            description: `Compra de ${cultivar?.name ?? "semente"}, cfe NF ${invoice}, de ${customer?.name ?? "cliente"}`,
            amount: totalPrice,
            dueDate: new Date(dueDate),
            companyId,
            customerId,
            buyId: updatedBuy.id,
          },
        });
      }
    } else {
      // Se mudou para AVISTA → apaga a conta vinculada
      if (existing.accountPayable) {
        await db.accountPayable.delete({
          where: { id: existing.accountPayable.id },
        });
      }
    }

    return NextResponse.json(updatedBuy);
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/buys/{id}:
 *   delete:
 *     summary: Deletar uma compra de semente
 *     tags:
 *       - Compra de Semente
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
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o compra para garantir que pertence à empresa do usuário
    const existingBuy = await db.buy.findUnique({
      where: { id },
      include: { accountPayable: true },
    });

    if (!existingBuy || existingBuy.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    await db.$transaction(async (tx) => {
      // 1️⃣ Reverter estoque da cultivar (decrementar)
      await tx.cultivar.update({
        where: { id: existingBuy.cultivarId },
        data: {
          stock: {
            decrement: existingBuy.quantityKg,
          },
        },
      });

      // 2️⃣ Apagar conta vinculada
      if (existingBuy.accountPayable) {
        await tx.accountPayable.delete({
          where: { id: existingBuy.accountPayable.id },
        });
      }

      // 3️⃣ Deletar a compra
      await tx.buy.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Compra excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Buscar compra
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o compra para garantir que pertence à empresa do usuário
    const compra = await db.buy.findUnique({ where: { id } });

    if (!compra || compra.companyId !== companyId) {
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
