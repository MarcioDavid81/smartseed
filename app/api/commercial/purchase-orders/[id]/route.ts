import { PurchaseOrderDomainService } from "@/core/domain/purchase-order/purchase-order-domain.service";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { purchaseOrderSchema } from "@/lib/schemas/purchaseOrderSchema";
import { NextRequest, NextResponse } from "next/server";

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
      // 🟢 atualiza cabeçalho
      await tx.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: orderData,
      });

      // 🟢 remove itens antigos
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: purchaseOrder.id },
      });

      // 🟢 recria itens
      for (const item of items) {
        await PurchaseOrderDomainService.validateItemCrate(
          tx,
          purchaseOrder.id,
          item.quantity,
        );

        await tx.purchaseOrderItem.create({
          data: {
            ...item,
            purchaseOrderId: purchaseOrder.id,
          },
        });
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
