import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { saleContractSchema } from "@/lib/schemas/saleContractSchema";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("CREATE_MASTER_DATA");

    const body = await req.json();
    const parsed = saleContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: {
          code: "INVALID_DATA",
          title: "Dados inválidos",
          message: parsed.error.issues[0].message,
        },
      });
    }
    const { items, ...saleContractData } = parsed.data;

    const createdSaleContract = await db.saleContract.create({
      data: {
        ...saleContractData,
        date: new Date(saleContractData.date),
        companyId: session.user.companyId,

        items: {
          create: items.map((item) => ({
            product: item.product,
            cultivarId: item.cultivarId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unityPrice: item.unityPrice,
            totalPrice: new Prisma.Decimal(item.quantity * item.unityPrice),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(createdSaleContract, {
      status: 201,
    });
  } catch (error) {
    console.error("Erro ao criar contrato de venda:", error);
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

    const saleContracts = await db.saleContract.findMany({
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

    return NextResponse.json(saleContracts);
  } catch (error) {
    console.error("Erro ao buscar contratos de venda:", error);
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