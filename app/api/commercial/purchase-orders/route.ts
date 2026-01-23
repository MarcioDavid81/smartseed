import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { purchaseOrderSchema } from "@/lib/schemas/purchaseOrderSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("🔥 ROTA PURCHASE-ORDERS ATINGIDA");
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("CREATE_MASTER_DATA");

    const body = await req.json();
    const parsed = purchaseOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }
    const { items, ...purchaseOrderData } = parsed.data;

    console.log("companyId:", session.user.companyId);
    console.log("items:", items.length);
    console.table(purchaseOrderData);

    const createdPurchaseOrder = await db.purchaseOrder.create({
      data: {
        ...purchaseOrderData,
        date: new Date(purchaseOrderData.date),
        companyId: session.user.companyId,

        items: {
          create: items.map((item) => ({
            productId: item.productId,
            cultivarId: item.cultivarId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unityPrice: item.unityPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(createdPurchaseOrder, {
      status: 201,
    });
  } catch (error) {
    console.error("Erro ao criar ordem de compra:", error);
    if (error instanceof PlanLimitReachedError) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }

    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
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

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        companyId,
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },

      },
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error("Erro ao buscar ordens de compra:", error);
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