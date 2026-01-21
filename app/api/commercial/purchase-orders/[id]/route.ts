import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT (
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    const data = await req.json();

    const existing = await db.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message:
              "Ordem de compra não encontrada ou não pertence à empresa do usuário",
          },
        },
        { status: 403 },
      );
    }

    const updated = await db.purchaseOrder.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
        console.error("Erro ao atualizar ordem de compra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE (
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const existing = await db.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message:
              "Ordem de compra não encontrada ou não pertence à empresa do usuário",
          },
        },
        { status: 403 },
      );
    }

    await db.purchaseOrder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Ordem de compra excluída com sucesso" }, { status: 200 });
    } catch (error) {
    console.error("Erro ao excluir ordem de compra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
        },
      },
      { status: 500 },
    );
  }
}
