import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { AccountStatus, PaymentCondition } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const {
      date,
      machineId,
      customerId,
      memberId,
      memberAdressId,
      description,
      totalValue,
      paymentCondition,
      dueDate,
    } = await req.json();

    const existing = await db.maintenance.findUnique({
      where: { id },
      include: { accountPayable: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Manutenção não encontrada ou acesso negado", {
        status: 403,
      });
    }

    const result = await db.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.findUnique({
        where: { id },
        include: { accountPayable: true },
      });
      if (!maintenance) throw new Error("Manutenção não encontrada");

      // 📝 Atualiza manutenção
      const updatedMaintenance = await tx.maintenance.update({
        where: { id },
        data: {
          date,
          machineId,
          customerId,
          memberId,
          memberAdressId,
          description,
          totalValue,
          paymentCondition,
          dueDate,
        },
      });

      // 💰 Sincroniza contas a pagar
      if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
        const machine = await tx.machine.findUnique({
          where: { id: machineId },
          select: { name: true },
        });

        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          select: { name: true },
        });

        const member = await tx.member.findUnique({
          where: { id: memberId },
          select: { name: true },
        });

        const description = `Manutenção de ${machine?.name ?? "máquina"}, em ${customer?.name ?? "cliente"}, em nome de ${member?.name ?? "sócio"}`;

        if (maintenance.accountPayable) {
          await tx.accountPayable.update({
            where: { id: maintenance.accountPayable.id },
            data: {
              description,
              amount: totalValue,
              dueDate: new Date(dueDate),
              customerId,
            },
          });
        } else {
          await tx.accountPayable.create({
            data: {
              description,
              amount: totalValue,
              dueDate: new Date(dueDate),
              companyId,
              customerId,
              memberId,
              memberAdressId,
              maintenanceId: updatedMaintenance.id,
              status: AccountStatus.PENDING,
            },
          });
        }
      } else if (existing.accountPayable) {
        await tx.accountPayable.delete({
          where: { id: existing.accountPayable.id },
        });
      }

      return updatedMaintenance;
    });

    return NextResponse.json(result, { status: 200 });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const existing = await db.maintenance.findUnique({
      where: { id },
      include: { accountPayable: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Manutenção não encontrada ou acesso negado", {
        status: 403,
      });
    }

    await db.$transaction(async (tx) => {
      // 🧾 Remove conta a pagar
      if (existing.accountPayable) {
        await tx.accountPayable.delete({
          where: { id: existing.accountPayable.id },
        });
      }

      // ❌ Remove manutenção
      await tx.maintenance.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Manutenção excluída com sucesso",
    });
  } catch (error) {
    console.log("Erro ao excluir manutenção", error);
    return NextResponse.json(
      { error: "Erro ao excluir manutenção" },
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

    const existing = await db.maintenance.findUnique({
      where: { id },
      include: {
        accountPayable: true,
        customer: true,
        member: true,
        memberAdress: true,
        machine: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Manutenção não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.log("Erro ao obter manutenção:", error);
    return new NextResponse("Erro ao obter manutenção", {
      status: 500,
    });
  }
}
