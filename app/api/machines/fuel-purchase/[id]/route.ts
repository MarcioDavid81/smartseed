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

  const existing = await db.fuelPurchase.findUnique({
    where: { id },
    include: { accountPayable: true },
  });

  if (!existing || existing.companyId !== companyId) {
    return new NextResponse("Compra não encontrada ou acesso negado", {
      status: 403,
    });
  }

  await db.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: data.customerId },
      select: { name: true },
    });
    const customerName = customer?.name ?? "cliente";

    // 🔁 Reverte estoque antigo
    await tx.fuelTank.update({
      where: { id: existing.tankId },
      data: { stock: { decrement: Number(existing.quantity) } },
    });

    // 🔁 Aplica estoque novo
    await tx.fuelTank.update({
      where: { id: data.tankId },
      data: { stock: { increment: Number(data.quantity) } },
    });

    // 📝 Atualiza compra
    const updatedPurchase = await tx.fuelPurchase.update({
      where: { id },
      data,
    });

    // 💰 Sincroniza contas a pagar
    if (
      data.paymentCondition === PaymentCondition.APRAZO &&
      data.dueDate
    ) {
      if (existing.accountPayable) {
        await tx.accountPayable.update({
          where: { id: existing.accountPayable.id },
          data: {
            description: `Compra de combustível, cfe NF ${data.invoiceNumber}, de ${customerName}`,
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
            purchaseId: updatedPurchase.id,
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
    message: "Compra de combustível atualizada com sucesso",
  });
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

  const existing = await db.fuelPurchase.findUnique({
    where: { id },
    include: { accountPayable: true },
  });

  if (!existing || existing.companyId !== companyId) {
    return new NextResponse("Compra não encontrada ou acesso negado", {
      status: 403,
    });
  }

  await db.$transaction(async (tx) => {
    // 🔁 Reverte estoque
    await tx.fuelTank.update({
      where: { id: existing.tankId },
      data: { stock: { decrement: Number(existing.quantity) } },
    });

    // 🧾 Remove conta a pagar
    if (existing.accountPayable) {
      await tx.accountPayable.delete({
        where: { id: existing.accountPayable.id },
      });
    }

    // ❌ Remove compra
    await tx.fuelPurchase.delete({
      where: { id },
    });
  });

  return NextResponse.json({
    message: "Compra de combustível excluída com sucesso",
  });
}


export async function GET (
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

    const existing = await db.fuelPurchase.findUnique({
      where: { id },
      include: { 
        accountPayable: true,
        customer: true,
        tank: true
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse(
        "Compra de combustível não encontrada ou acesso negado",
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(existing);
  } catch (error) {
    console.log("Erro ao obter compra de combustível:", error); 
    return new NextResponse("Erro ao obter compra de combustível", {
      status: 500,
    });
  }
}