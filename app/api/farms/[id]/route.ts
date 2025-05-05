import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, area } = await req.json();
    const { id } = params;

    const farm = await db.farm.update({
      where: { id },
      data: { name, area },
    });

    return NextResponse.json(farm, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar fazenda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await db.farm.delete({ where: { id } });

    return NextResponse.json({ message: "Fazenda deletada com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar fazenda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
