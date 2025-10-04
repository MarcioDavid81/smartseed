import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { industryTransporterSchema } from "@/lib/schemas/industryTransporter";
import { NextRequest, NextResponse } from "next/server";

export async function PUT (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const body = await req.json();

    const parsed = industryTransporterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await db.industryTransporter.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Transportador não encontrado ou acesso negado", { status: 403 });
    }

    const updated = await db.industryTransporter.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar transportador:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    const existing = await db.industryTransporter.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Transportador não encontrado ou acesso negado", { status: 403 });
    }

    const deleted = await db.industryTransporter.delete({
      where: { id },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar transportador:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


export async function GET (req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    const existing = await db.industryTransporter.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Transportador não encontrado ou acesso negado", { status: 403 });
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transportador:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
