import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { fuelPurchaseSchema } from "@/lib/schemas/fuelPurchaseSchema";
import { db } from "@/lib/prisma";
import { PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });
    const body = await req.json();
    const parsed = fuelPurchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const tank = await db.fuelTank.findUnique({
      where: {
        id: data.tankId,
      },
      select: {
        capacity: true,
        stock: true,
      },
    });

    if (!tank) {
      return NextResponse.json(
        { error: "Tanque não encontrado" },
        { status: 404 },
      );
    }

    const quantityPurchase = data.quantity;

    const availableSpace = tank.capacity - tank.stock;

    if (quantityPurchase > availableSpace) {
      return NextResponse.json(
        {
          error: `Quantidade solicitada (${quantityPurchase} L) excede o espaço disponível no tanque (${availableSpace} L)`,
        },
        { status: 400 },
      );
    }

    const customer = await db.customer.findUnique({
      where: { id: data.customerId },
      select: { id: true, name: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    const member = await db.member.findUnique({
      where: { id: data.memberId },
      select: { id: true, name: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Sócio não encontrado" },
        { status: 404 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      const fuelPurchase = await tx.fuelPurchase.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
      });

      await tx.fuelTank.update({
        where: {
          id: data.tankId,
        },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });

      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        await tx.accountPayable.create({
          data: {
            description: `Compra de combustível, cfe NF ${fuelPurchase.invoiceNumber}, de ${customer?.name ?? "cliente"}, em nome de ${member?.name ?? "sócio"}`,
            amount: data.totalValue,
            dueDate: new Date(data.dueDate),
            companyId: session.user.companyId,
            customerId: data.customerId,
            memberId: data.memberId,
            memberAdressId: data.memberAdressId,
            fuelPurchaseId: fuelPurchase.id,
          },
        });
      }

      return fuelPurchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar compra:", error);
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

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    const fuelPurchases = await db.fuelPurchase.findMany({
      where: { companyId },
      include: {
        customer: true,
        member: true,
        memberAdress: true,
        accountPayable: true,
        tank: true,
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          invoiceNumber: "desc",
        },
      ],
    });

    return NextResponse.json(fuelPurchases, { status: 200 });
  } catch (error) {
    console.log("Erro ao buscar compras de combustível:", error);

    return NextResponse.json(
      { error: "Erro ao buscar compras de combustível" },
      { status: 500 },
    );
  }
}
