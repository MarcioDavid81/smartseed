import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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

  const data = await req.json();
  const { id } = params;
  const { companyId } = payload;

  const existing = await db.refuel.findUnique({
    where: { id },
  });

  if (!existing || existing.companyId !== companyId) {
    return NextResponse.json(
      { error: "Abastecimento não encontrado ou acesso negado" },
      { status: 403 },
    );
  }

  await db.$transaction(async (tx) => {
    // 🔁 Devolve a quantidade da transação ao estoque
    await tx.fuelTank.update({
      where: { id: existing.tankId },
      data: { stock: { increment: Number(existing.quantity) } },
    });

    // 🔁 Retira a nova quantidade da transação do estoque
    await tx.fuelTank.update({
      where: { id: data.tankId },
      data: { stock: { decrement: Number(data.quantity) } },
    });
  });

  // 📝 Atualiza a transação
  await db.refuel.update({
    where: { id },
    data,
  });

  return NextResponse.json({ message: "Abastecimento atualizado com sucesso" });
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
  const existing = await db.refuel.findUnique({
    where: { id },
  });

  if (!existing || existing.companyId !== companyId) {
    return new NextResponse("Abastecimento não encontrado ou acesso negado", {
      status: 403,
    });
  }
  await db.$transaction(async (tx) => {
    // 🔁 Reverte estoque
    await tx.fuelTank.update({
      where: { id: existing.tankId },
      data: { stock: { increment: Number(existing.quantity) } },
    });
    // ❌ Remove abastecimento
    await tx.refuel.delete({
      where: { id },
    });
  });
  return NextResponse.json({ message: "Abastecimento excluído com sucesso" });
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

    const existing = await db.refuel.findUnique({
      where: { id },
      include: {
        tank: true,
        machine: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Abastecimento não encontrado ou acesso negado" },
        { status: 403 },
      );
    }
    
    return NextResponse.json(existing);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar abastecimento" },
      { status: 500 },
    );
  }
}
