import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { AccountStatus, PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { recalcPurchaseOrderStatus } from "@/app/_helpers/recalculatePurchaseOrderStatus";

/**
 * @swagger
 * /api/insumos/purchases/{id}:
 *   put:
 *     summary: Atualizar uma compra de insumos
 *     tags:
 *       - Compra de Insumos
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
 *               productId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               invoiceNumber:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *               quantityKg:
 *                 type: number
 *               farmId:
 *                 type: string
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
      productId,
      customerId,
      date,
      invoiceNumber,
      unitPrice,
      totalPrice,
      quantity,
      farmId,
      notes,
      paymentCondition,
      dueDate,
    } = await req.json();

    // Verificação de acesso
    const existing = await db.purchase.findUnique({
      where: { id },
      include: { accountPayable: true },
    });
    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    const updated = await db.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
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

      if (!purchase) throw new Error("Compra não encontrada");

      // 1. Calcular o delta de quantidade
      const delta = Number(quantity) - Number(purchase.quantity);

      // 2. Se quantidade, produto ou fazenda mudaram, ajustar estoque
      if (
        purchase.quantity !== quantity ||
        purchase.productId !== productId ||
        purchase.farmId !== farmId
      ) {
        // Reverter estoque anterior
        await tx.productStock.update({
          where: {
            productId_farmId: {
              productId: purchase.productId,
              farmId: purchase.farmId,
            },
          },
          data: {
            stock: {
              decrement: delta,
            },
          },
        });

        // Aplicar novo impacto
        await tx.productStock.upsert({
          where: {
            productId_farmId: {
              productId,
              farmId,
            },
          },
          update: {
            stock: {
              increment: quantity,
            },
          },
          create: {
            productId,
            farmId,
            companyId,
            stock: quantity,
          },
        });
      }

      // 3. Ajustar contrato se houver
      if (
        purchase.purchaseOrderItem &&
        purchase.purchaseOrderItem.purchaseOrder
      ) {
        const item = purchase.purchaseOrderItem;
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

      // 4. Atualizar compra
      return await tx.purchase.update({
        where: { id },
        data: {
          productId,
          customerId,
          date: new Date(date),
          invoiceNumber,
          unitPrice,
          totalPrice,
          quantity,
          farmId,
          notes,
          paymentCondition,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
    });
    // Sincronizar AccountPayable
    if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
      const product = await db.product.findUnique({
        where: { id: productId },
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
            description: `Compra de ${product?.name ?? "insumo"}, cfe NF ${invoiceNumber}, de ${customer?.name ?? "cliente"}`,
            amount: totalPrice,
            dueDate: new Date(dueDate),
            customerId,
          },
        });
      } else {
        // Cria nova conta
        await db.accountPayable.create({
          data: {
            description: `Compra de ${product?.name ?? "insumo"}, cfe NF ${invoiceNumber}, de ${customer?.name ?? "cliente"}`,
            amount: totalPrice,
            dueDate: new Date(dueDate),
            companyId,
            customerId,
            purchaseId: updated.id,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/insumos/purchases/{id}:
 *   delete:
 *     summary: Deletar uma compra de insumos
 *     tags:
 *       - Compra de Insumos
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

    // Verificação de acesso
    const existing = await db.purchase.findUnique({
      where: { id },
      include: { accountPayable: true },
    });
    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // 🚫 Impede exclusão de compra com conta já paga
    if (existing.accountPayable?.status === AccountStatus.PAID) {
      return NextResponse.json(
        {
          error: {
            code: "PURCHASE_ALREADY_PAID",
            title: "Ação não permitida",
            message:
              "Não é possível excluir uma compra que já possui pagamento confirmado.",
          },
        },
        { status: 400 },
      );
    }

    const deleted = await db.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
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

      if (!purchase) throw new Error("Compra não encontrada");

      // 1. Reverter estoque do insumo (decrementar)
      await tx.productStock.update({
        where: {
          productId_farmId: {
            productId: purchase.productId,
            farmId: purchase.farmId,
          },
        },
        data: {
          stock: {
            decrement: purchase.quantity,
          },
        },
      });

      // 2. Apagar conta vinculada
      if (purchase.accountPayable) {
        await db.accountPayable.delete({
          where: { id: purchase.accountPayable.id },
        });
      }

      // 3. Se for atendimento de pedido de compra, reverter a quantidade entregue
      if (purchase.purchaseOrderItemId && purchase.purchaseOrderItem) {
        const item = purchase.purchaseOrderItem;

        if (Number(item.fulfilledQuantity) < Number(purchase.quantity)) {
          throw new Error("INVALID_FULFILLED_QUANTITY_REVERT");
        }

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              decrement: purchase.quantity,
            },
          },
        });

        // 🔥 RECALCULAR STATUS DO PEDIDO
        await recalcPurchaseOrderStatus(tx, item.purchaseOrderId);
      }

      // 4. Excluir compra
      return await tx.purchase.delete({ where: { id } });
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const purchase = await db.purchase.findUnique({
      where: { id },
      include: {
        product: true, // traz informações do insumo
        customer: true, // traz fornecedor
        farm: true, // traz fazenda
        accountPayable: true, // traz conta vinculada
      },
    });

    if (!purchase || purchase.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Erro ao buscar compra:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
