import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { recalcPurchaseOrderStatus } from "@/app/_helpers/recalculatePurchaseOrderStatus";

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
    const body = await req.json();

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
    } = body;

    // Verificação de acesso
    const existing = await db.buy.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // =========================================================
    // TRANSACTION
    // =========================================================
    const result = await db.$transaction(async (tx) => {
      const buy = await tx.buy.findUnique({
        where: { id },
        include: {
          purchaseOrderItem: {
            include: {
              purchaseOrder: true,
            },
          },
          accountPayable: true,
        },
      });

      if (!buy) throw new Error("Compra não encontrada");

      // -------------------------
      // 1) calcular delta
      // -------------------------
      const delta = Number(quantityKg) - Number(buy.quantityKg);

      // -------------------------
      // 2) ajustar estoque
      // -------------------------
      if (delta !== 0 || cultivarId !== buy.cultivarId) {
        // devolve estoque antigo
        await tx.cultivar.update({
          where: { id: buy.cultivarId },
          data: { stock: { decrement: buy.quantityKg } },
        });

        // adiciona novo
        await tx.cultivar.update({
          where: { id: cultivarId },
          data: { stock: { increment: quantityKg } },
        });
      }

      // -------------------------
      // 3) ajustar contrato (se houver)
      // -------------------------
      if (buy.purchaseOrderItemId && buy.purchaseOrderItem) {
        const item = buy.purchaseOrderItem;

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              increment: delta,
            },
          },
        });

        // validar saldo do pedido
        const updatedItem = await tx.purchaseOrderItem.findUnique({
          where: { id: item.id },
        });

        if (
          Number(updatedItem!.fulfilledQuantity) > Number(updatedItem!.quantity)
        ) {
          throw new Error("Quantidade excede o saldo do pedido");
        }

        // recalcular status do pedido
        await recalcPurchaseOrderStatus(tx, item.purchaseOrderId);
      }

      // -------------------------
      // 4) atualizar compra
      // -------------------------
      const updatedBuy = await tx.buy.update({
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

      // -------------------------
      // 5) sincronizar financeiro
      // -------------------------
      if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
        const cultivar = await tx.cultivar.findUnique({
          where: { id: cultivarId },
          select: { name: true },
        });

        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          select: { name: true },
        });

        const description = `Compra de ${cultivar?.name ?? "semente"}, cfe NF ${invoice ?? "S/NF"}, de ${customer?.name ?? "cliente"}`;

        if (buy.accountPayable) {
          await tx.accountPayable.update({
            where: { id: buy.accountPayable.id },
            data: {
              description,
              amount: totalPrice,
              dueDate: new Date(dueDate),
              customerId,
            },
          });
        } else {
          await tx.accountPayable.create({
            data: {
              description,
              amount: totalPrice,
              dueDate: new Date(dueDate),
              companyId,
              customerId,
              buyId: updatedBuy.id,
            },
          });
        }
      } else {
        // mudou para à vista → remove conta
        if (buy.accountPayable) {
          await tx.accountPayable.delete({
            where: { id: buy.accountPayable.id },
          });
        }
      }

      return updatedBuy;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao atualizar compra:", error);

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

    // Verificação de acesso inicial
    const existingBuy = await db.buy.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!existingBuy || existingBuy.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // =========================================================
    // TRANSACTION
    // =========================================================
    const deleted = await db.$transaction(async (tx) => {
      // buscar novamente dentro da transaction
      const buy = await tx.buy.findUnique({
        where: { id },
        include: {
          accountPayable: true,
          purchaseOrderItem: {
            include: {
              purchaseOrder: true,
            },
          },
        },
      });

      if (!buy) throw new Error("Compra não encontrada");

      // 1️⃣ Reverter estoque
      await tx.cultivar.update({
        where: { id: buy.cultivarId },
        data: {
          stock: {
            decrement: buy.quantityKg,
          },
        },
      });

      // 2️⃣ Remover conta financeira
      if (buy.accountPayable) {
        await tx.accountPayable.delete({
          where: { id: buy.accountPayable.id },
        });
      }

      // 3️⃣ Reverter atendimento do pedido
      if (buy.purchaseOrderItemId && buy.purchaseOrderItem) {
        const item = buy.purchaseOrderItem;

        if (Number(item.fulfilledQuantity) < Number(buy.quantityKg)) {
          throw new Error("INVALID_FULFILLED_QUANTITY_REVERT");
        }

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              decrement: buy.quantityKg,
            },
          },
        });

        // 🔥 RECALCULAR STATUS DO PEDIDO
        await recalcPurchaseOrderStatus(tx, item.purchaseOrderId);
      }

      // 4️⃣ deletar a remessa
      return await tx.buy.delete({ where: { id } });
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao deletar compra:", error);

    return NextResponse.json(
      {
        error: error.message ?? "Erro interno no servidor",
      },
      { status: 500 },
    );
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
    const compra = await db.buy.findUnique({
      where: { id },
      include: {
        cultivar: true, // traz informações do cultivar
        customer: true, // traz fornecedor
        accountPayable: true, // traz conta vinculada
      },
    });

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
