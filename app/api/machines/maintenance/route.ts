import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { maintenanceSchema } from "@/lib/schemas/maintenanceSchema";
import { db } from "@/lib/prisma";
import { PaymentCondition } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";

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

    const maintenance = await db.$transaction(async (tx) => {
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
            description: `Manutenção de ${machine.name}, em ${customerName}`,
            amount: data.totalValue,
            dueDate: new Date(data.dueDate),
            companyId,
            customerId: data.customerId,
            maintenanceId: createdMaintenance.id,
          },
        });
      }

      return createdMaintenance;
    });

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.log("Erro ao criar manutenção da máquina:", error);
    return NextResponse.json(
      { error: "Erro ao criar manutenção da máquina" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const machineMaintenances = await db.maintenance.findMany({
      where: { companyId },
      include: {
        machine: {
          select: { id: true, name: true },
        },
        customer: {
          select: { id: true, name: true },
        },
        accountPayable: {
          select: { id: true, amount: true, dueDate: true },
        },
      },
      orderBy: [{ date: "desc" }],
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
