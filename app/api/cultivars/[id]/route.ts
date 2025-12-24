import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    const { name, product, status } = await req.json();

    const allowedStatus = ["BENEFICIANDO", "BENEFICIADO"] as const;
    if (status && !allowedStatus.includes(status)) {
      return new NextResponse("Status inválido", { status: 400 });
    }

    const existing = await db.cultivar.findUnique({ where: { id } });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    const updated = await db.cultivar.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(product && { product }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar cultivar:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const existing = await db.cultivar.findUnique({ where: { id } });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    const deleted = await db.cultivar.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar cultivar:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o cultivar para garantir que pertence à empresa do usuário
    const cultivar = await db.cultivar.findUnique({ where: { id } });

    if (!cultivar || cultivar.companyId !== companyId) {
      return new NextResponse("Cultivar não encontrado ou acesso negado", { status: 403 });
    }

    return NextResponse.json(cultivar);
  } catch (error) {
    console.error("Erro ao buscar cultivar:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
