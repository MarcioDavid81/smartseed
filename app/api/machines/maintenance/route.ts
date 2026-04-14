import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { maintenanceSchema } from "@/lib/schemas/maintenanceSchema";
import { db } from "@/lib/prisma";
import { PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });

    const body = await req.json();
    const parsed = maintenanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const customer = await db.customer.findUnique({
      where: {
        id: data.customerId,
      },
      select: {
        name: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    const machine = await db.machine.findUnique({
      where: {
        id: data.machineId,
      },
      select: {
        name: true,
      },
    });

    if (!machine) {
      return NextResponse.json(
        { error: "Máquina não encontrada" },
        { status: 404 },
      );
    }

    const member = await db.member.findUnique({
      where: {
        id: data.memberId,
      },
      select: {
        name: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Sócio não encontrado" },
        { status: 404 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      const createdMaintenance = await tx.maintenance.create({
        data: {
          ...data,
          date: new Date(data.date),
          companyId,
        },
      });

      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        const customer = await tx.customer.findUnique({
          where: {
            id: data.customerId,
          },
          select: { name: true },
        });
        const customerName = customer?.name ?? "cliente";

        await tx.accountPayable.create({
          data: {
            description: `Manutenção de ${machine.name}, em ${customerName}, em nome de ${member.name}`,
            amount: data.totalValue,
            dueDate: new Date(data.dueDate),
            companyId,
            customerId: data.customerId,
            memberId: data.memberId,
            memberAdressId: data.memberAdressId,
            maintenanceId: createdMaintenance.id,
          },
        });
      }

      return createdMaintenance;
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

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    const machineMaintenances = await db.maintenance.findMany({
      where: { companyId },
      include: {
        machine: true,
        customer: true,
        member: true,
        memberAdress: true,
        accountPayable: true,
      },
      orderBy: [
        { 
          date: "desc" 
        },
        {
          createdAt: "desc",
        }
      ],
    });

    return NextResponse.json(machineMaintenances, { status: 200 });
  } catch (error) {
    console.log("Erro ao buscar manutenções da máquina:", error);

    return NextResponse.json(
      { error: "Erro ao buscar manutenções da máquina" },
      { status: 500 },
    );
  }
}
