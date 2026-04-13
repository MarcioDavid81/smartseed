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
      invoiceNumber,
      quantity,
      unitPrice,
      totalValue,
      customerId,
      memberId,
      memberAdressId,
      tankId,
      paymentCondition,
      dueDate,
    } = await req.json();

    const existing = await db.fuelPurchase.findUnique({
      where: { id },
      include: { accountPayable: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Compra não encontrada ou acesso negado", {
        status: 403,
      });
    }

    const result = await db.$transaction(async (tx) => {
      const fuelPurchase = await tx.fuelPurchase.findUnique({
        where: { id },
        include: { accountPayable: true },
      });
      if (!fuelPurchase) throw new Error("Compra não encontrada");

      // 🔁 Reverte estoque antigo
      await tx.fuelTank.update({
        where: { id: existing.tankId },
        data: { stock: { decrement: Number(existing.quantity) } },
      });

      // 🔁 Aplica estoque novo
      await tx.fuelTank.update({
        where: { id: tankId },
        data: { stock: { increment: Number(quantity) } },
      });

      // 📝 Atualiza compra
      const updatedPurchase = await tx.fuelPurchase.update({
        where: { id },
        data: {
          date,
          invoiceNumber,
          quantity,
          unitPrice,
          totalValue,
          customerId,
          memberId,
          memberAdressId,
          tankId,
          paymentCondition,
          dueDate,
        },
      });

      // 💰 Sincroniza contas a pagar
      if (paymentCondition === PaymentCondition.APRAZO && dueDate) {
        const customer = await db.customer.findUnique({
          where: { id: customerId },
          select: {
            name: true,
          },
        });
        const member = await db.member.findUnique({
          where: { id: memberId },
          select: {
            name: true,
          },
        });

        const description = `Compra de combustível, cfe NF ${invoiceNumber}, de ${customer?.name ?? "cliente"} em nome de ${member?.name ?? "sócio"}`;

        if (fuelPurchase.accountPayable) {
          await tx.accountPayable.update({
            where: { id: fuelPurchase.accountPayable.id },
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
              description: description,
              amount: totalValue,
              dueDate: new Date(dueDate),
              companyId,
              customerId,
              memberId,
              memberAdressId,
              purchaseId: updatedPurchase.id,
              status: AccountStatus.PENDING,
            },
          });
        }
      }
      return updatedPurchase;
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const fuelPurchase = await db.fuelPurchase.findUnique({
      where: { id },
      include: {
        customer: true,
        member: true,
        memberAdress: true,
        tank: true,
        accountPayable: true,
      },
    });

    if (!fuelPurchase || fuelPurchase.companyId !== companyId) {
      return new NextResponse(
        "Compra de combustível não encontrada ou acesso negado",
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(fuelPurchase, { status: 200 });
  } catch (error) {
    console.log("Erro ao obter compra de combustível:", error);
    return new NextResponse("Erro ao obter compra de combustível", {
      status: 500,
    });
  }
}
