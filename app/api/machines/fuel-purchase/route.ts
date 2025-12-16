import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { fuelPurchaseSchema } from "@/lib/schemas/fuelPurchaseSchema";
import { db } from "@/lib/prisma";
import { PaymentCondition } from "@prisma/client";

export async function POST(req: Request) {
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

    const fuelPurchase = await db.$transaction(async (tx) => {
      const createdPurchase = await tx.fuelPurchase.create({
        data: {
          ...data,
          date: new Date(data.date),
          companyId,
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
        const customer = await tx.customer.findUnique({
          where: {
            id: data.customerId,
          },
          select: { name: true },
        });
        const document = data.invoiceNumber ?? "S/NF";
        const customerName = customer?.name ?? "cliente";

        await tx.accountPayable.create({
          data: {
            description: `Compra de combustível, cfe NF ${document}, de ${customerName}`,
            amount: data.totalValue,
            dueDate: new Date(data.dueDate),
            companyId,
            customerId: data.customerId,
            fuelPurchaseId: createdPurchase.id,
          },
        });
      }

      return createdPurchase;
    });

    return NextResponse.json(fuelPurchase, { status: 201 });
  } catch (error) {
    console.log("Erro ao criar compra de combustível:", error);
    return NextResponse.json(
      { error: "Erro ao criar compra de combustível" },
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
    const fuelPurchases = await db.fuelPurchase.findMany({
      where: { companyId },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        accountPayable: {
          select: { id: true, amount: true, dueDate: true },
        },
        tank: {
          select: { id: true, name: true, stock: true },
        },
      },
      orderBy: [{ date: "desc" }, { invoiceNumber: "desc" }],
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
