import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AccountStatus, PaymentCondition } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new NextResponse("Token ausente", { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return new NextResponse("Token inválido", { status: 401 });

  const data = await req.json();
  const { id } = params;
  const { companyId } = payload;

  try {
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
      const machine = await tx.machine.findUnique({
        where: { id: data.machineId },
        select: { name: true },
      });
      const machineName = machine?.name ?? "máquina";

      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
        select: { name: true },
      });
      const customerName = customer?.name ?? "cliente";

      // 📝 Atualiza manutenção
      const updatedMaintenance = await tx.maintenance.update({
        where: { id },
        data,
      });

      // 💰 Sincroniza contas a pagar
      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        if (existing.accountPayable) {
          await tx.accountPayable.update({
            where: { id: existing.accountPayable.id },
            data: {
              description: `Manutenção de ${machineName}, em ${customerName}`,
              amount: data.totalValue,
              dueDate: new Date(data.dueDate),
              customerId: data.customerId,
            },
          });
        } else {
          await tx.accountPayable.create({
            data: {
              description: `Compra de combustível, cfe NF ${data.invoiceNumber}, de ${customerName}`,
              amount: data.totalValue,
              dueDate: new Date(data.dueDate),
              companyId,
              customerId: data.customerId,
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
    });

    return NextResponse.json({
      message: "Manutenção atualizada com sucesso",
    });
  } catch (error) {
    console.log("Erro ao atualizar manutenção", error);
    return NextResponse.json(
      { error: "Erro ao atualizar manutenção" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new NextResponse("Token ausente", { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return new NextResponse("Token inválido", { status: 401 });

  const { id } = params;
  const { companyId } = payload;

  try {
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
    console.log("Erro ao excluir manutenção", error)
    return NextResponse.json(
      { error: "Erro ao excluir manutenção" },
      { status: 500 },
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { companyId } = payload;

    const existing = await db.maintenance.findUnique({
      where: { id },
      include: {
        accountPayable: true,
        customer: true,
        machine: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Manutenção não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(existing);
  } catch (error) {
    console.log("Erro ao obter manutenção:", error);
    return new NextResponse("Erro ao obter manutenção", {
      status: 500,
    });
  }
}
