import { PurchaseOrderDomainService } from "@/core/domain/purchase-order/purchase-order-domain.service";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { purchaseOrderSchema } from "@/lib/schemas/purchaseOrderSchema";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

type Params = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const { companyId } = auth;
    const body = await req.json();

    const parsed = purchaseOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { items, ...orderData } = parsed.data;

    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: {
        id: params.id,
        companyId,
      },
      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Ordem de compra não encontrada" },
        { status: 404 },
      );
    }

    await db.$transaction(async (tx) => {
      // Atualiza cabeçalho
      await tx.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: orderData,
      });

      const existingItems = purchaseOrder.items;

      const existingMap = new Map(
        existingItems.map((item) => [item.id, item])
      );

      const incomingMap = new Map(
        items.filter(i => i.id).map((item) => [item.id, item])
      );

      // 1️⃣ Atualizar itens existentes
      for (const incomingItem of items) {
        if (incomingItem.id && existingMap.has(incomingItem.id)) {
          const existingItem = existingMap.get(incomingItem.id)!;

          const newQuantity = new Prisma.Decimal(incomingItem.quantity);

          // Regra: não pode ser menor que já recebido
          if (newQuantity.lt(existingItem.fulfilledQuantity)) {
            throw new Error(
              "Quantidade não pode ser menor que a já recebida"
            );
          }

          await tx.purchaseOrderItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQuantity,
              unityPrice: incomingItem.unityPrice,
              totalPrice: newQuantity.mul(incomingItem.unityPrice),
            },
          });
        }
      }

      // 2️⃣ Criar novos itens
      for (const incomingItem of items) {
        if (!incomingItem.id) {
          await tx.purchaseOrderItem.create({
            data: {
              ...incomingItem,
              purchaseOrderId: purchaseOrder.id,
            },
          });
        }
      }

      // 3️⃣ Deletar itens removidos
      for (const existingItem of existingItems) {
        if (!incomingMap.has(existingItem.id)) {
          if (existingItem.fulfilledQuantity.gt(0)) {
            throw new Error(
              "Não é possível remover item que já teve recebimento"
            );
          }

          await tx.purchaseOrderItem.delete({
            where: { id: existingItem.id },
          });
        }
      }
    });

    return NextResponse.json(
      { message: "Ordem de compra atualizada com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar ordem de compra:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });

    if (!purchaseOrder || purchaseOrder.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message:
              "Ordem de compra não encontrada ou não pertence à empresa do usuário",
          },
        },
        { status: 404 },
      );
    }

    await db.$transaction(async (tx) => {
      const canDelete = await PurchaseOrderDomainService.canDeleteOrder(tx, id);

      if (!canDelete) {
        throw new Error(
          "Ordem de compra possui movimentações e não pode ser excluída",
        );
      }

      // 1️⃣ remove os itens primeiro
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // 2️⃣ agora remove a ordem
      await tx.purchaseOrder.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: "Ordem de compra excluída com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Ordem de compra possui movimentações e não pode ser excluída"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CANNOT_DELETE",
            title: "Exclusão não permitida",
            message:
              "Não é possível excluir a ordem de compra pois existem movimentações vinculadas",
          },
        },
        { status: 409 },
      );
    }

    console.error("Erro ao excluir ordem de compra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        },
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

    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id, companyId },
      include: {
        customer: true,
        items: {
          include: {
            seedPurchases: true,
            inputsPurchases: true,
            product: true,
            cultivar: true,
          },
        },
      },
    });

    if (!purchaseOrder || purchaseOrder.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message:
              "Ordem de compra não encontrada ou não pertence à empresa do usuário",
          },
        },
        { status: 404 },
      );
    }

    const items = purchaseOrder.items.map((item) => {
      const deliveries = [
        ...item.seedPurchases.map((buy) => ({
          id: buy.id,
          date: buy.date instanceof Date ? buy.date.toISOString() : String(buy.date),
          invoice: String(buy.invoice ?? ""),
          quantity: Number(buy.quantityKg),
          unit: item.unit,
          totalPrice: Number(buy.totalPrice),
        })),
        ...item.inputsPurchases.map((purchase) => ({
          id: purchase.id,
          date: purchase.date instanceof Date ? purchase.date.toISOString() : String(purchase.date),
          invoice: String(purchase.invoiceNumber ?? ""),
          quantity: Number(purchase.quantity),
          unit: item.unit,
          totalPrice: Number(purchase.totalPrice),
        })),
      ].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return {
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        fulfilledQuantity: Number(item.fulfilledQuantity),
        remainingQuantity: Number(item.quantity) - Number(item.fulfilledQuantity),
        unit: item.unit,
        unityPrice: Number(item.unityPrice),
        totalPrice: Number(item.totalPrice),
        product: item.product ? { id: item.product.id, name: item.product.name } : null,
        cultivar: item.cultivar ? { id: item.cultivar.id, name: item.cultivar.name } : null,
        deliveries,
      };
    });

    const deliveries = items
      .flatMap((item) => item.deliveries)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

    return NextResponse.json({
      id: purchaseOrder.id,
      type: purchaseOrder.type,
      date: purchaseOrder.date,
      document: purchaseOrder.document,
      status: purchaseOrder.status,
      notes: purchaseOrder.notes,
      customerId: purchaseOrder.customerId,

      customer: {
        id: purchaseOrder.customer.id,
        name: purchaseOrder.customer.name,
      },

      items,
      deliveries,
    },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar ordem de compra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          title: "Erro interno",
          message: "Erro interno no servidor",
        },
      },
      { status: 500 },
    );
  }
}
