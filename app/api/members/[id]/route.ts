import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { memberSchema } from "@/lib/schemas/memberSchema";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    const body = await req.json();

    const parsed = memberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await db.member.findUnique({ where: { id } });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Membro não encontrado ou não pertence à empresa" },
        { status: 404 },
      );
    }

    const updated = await db.member.update({
      where: { id },
      data: {
        ...data,
        adresses: {
          deleteMany: {},
          create: data.adresses,
        },
      },
    })

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const existing = await db.member.findUnique({
      where: { id },
      include: {
        adresses: true,
      }
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "MEMBER_NOT_FOUND",
            title: "Membro não encontrado",
            message:
              "O membro não foi localizada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Erro ao obter membro:", error);
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