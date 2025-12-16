import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { refuelSchema } from "@/lib/schemas/refuelSchema";
import { db } from "@/lib/prisma";

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
    const parsed = refuelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const machine = await db.machine.findUnique({
      where: {
        id: data.machineId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!machine) {
      return NextResponse.json(
        { error: "Máquina não encontrada" },
        { status: 404 },
      );
    }

    const refuel = await db.$transaction(async (tx) => {
      const createdRefuel = await tx.refuel.create({
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
            decrement: data.quantity,
          },
        },
      });

      return createdRefuel;
    });
    return NextResponse.json(refuel, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao abastecer a máquina" },
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
    const refuels = await db.refuel.findMany({
      where: {
        companyId,
      },
      include: {
        machine: true,
        tank: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json(refuels, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar refuels" },
      { status: 500 },
    );
  }
}
