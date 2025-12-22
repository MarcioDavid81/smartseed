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
        {
          error: {
            code: "MACHINE_NOT_FOUND",
            title: "Máquina não encontrada",
            message: "Máquina não encontrada",
          },
        },
        { status: 404 },
      );
    }

    const refuel = await db.$transaction(async (tx) => {
      // 1️⃣ tenta descontar o estoque de forma atômica
      const updated = await tx.fuelTank.updateMany({
        where: {
          id: data.tankId,
          stock: {
            gte: data.quantity,
          },
        },
        data: {
          stock: {
            decrement: data.quantity,
          },
        },
      });

      // 2️⃣ se não atualizou nada, estoque insuficiente
      if (updated.count === 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      // 3️⃣ cria o abastecimento
      const createdRefuel = await tx.refuel.create({
        data: {
          ...data,
          date: new Date(data.date),
          companyId,
        },
      });

      return createdRefuel;
    });

    return NextResponse.json(refuel, { status: 201 });
  } catch (error) {
    console.log("Erro ao abastecer a máquina:", error);
    return NextResponse.json(
      {
        error: {
          code: "INSUFFICIENT_STOCK",
          title: "Estoque insuficiente",
          message: "O tanque não possui combustível suficiente.",
        },
      },
      { status: 400 },
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
