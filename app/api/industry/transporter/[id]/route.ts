import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { industryTransporterSchema } from "@/lib/schemas/industryTransporter";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await db.industryTransporter.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Transportador não encontrado ou acesso negado", {
        status: 403,
      });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: "TOKEN_MISSING",
            title: "Autenticação necessária",
            message: "Token ausente.",
          },
        },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          error: {
            code: "TOKEN_INVALID",
            title: "Token inválido",
            message: "Não foi possível validar suas credenciais.",
          },
        },
        { status: 401 },
      );
    }

    const { id } = params;
    const { companyId } = payload;

    const existing = await db.industryTransporter.findUnique({
      where: { 
        id,
        companyId,
       },
      include: {
        industrySales: true,
        industryHarvests: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSPORTER_NOT_FOUND",
            title: "Transportador não encontrado",
            message:
              "O transportador não foi encontrado ou você não tem permissão para acessá-lo.",
          },
        },
        { status: 403 },
      );
    }

    if (existing.industrySales.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSPORTER_HAS_SALES",
            title: "Transportador possui vendas associadas",
            message:
              "O transportador não pode ser deletado enquanto houver vendas associadas.",
          },
        },
        { status: 400 },
      );
    }

    if (existing.industryHarvests.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSPORTER_HAS_HARVESTS",
            title: "Transportador possui colheitas associadas",
            message:
              "O transportador não pode ser deletado enquanto houver colheitas associadas.",
          },
        },
        { status: 400 },
      );
    }

    const deleted = await db.industryTransporter.delete({
      where: { 
        id,
        companyId,
       },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar transportador:", error);
    return NextResponse.json(
      {
        error: {
          code: "DELETE_TRANSPORTER_ERROR",
          title: "Erro ao deletar transportador",
          message:
            "Ocorreu um erro inesperado durante a tentativa de deletar o transportador.",
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
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: "TOKEN_MISSING",
            title: "Autenticação necessária",
            message: "Token ausente.",
          },
        },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          error: {
            code: "TOKEN_INVALID",
            title: "Token inválido",
            message: "Não foi possível validar suas credenciais.",
          },
        },
        { status: 401 },
      );
    }

    const { id } = params;
    const { companyId } = payload;
    
    const existing = await db.industryTransporter.findUnique({ 
      where: { id },
      include: {
        industrySales: true,
        industryHarvests: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSPORTER_NOT_FOUND",
            title: "Transportador não encontrado",
            message:
              "O transportador não foi encontrado ou você não tem permissão para acessá-lo.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transportador:", error);
    return NextResponse.json(
      {
        error: {
          code: "GET_TRANSPORTER_ERROR",
          title: "Erro ao buscar transportador",
          message:
            "Ocorreu um erro inesperado durante a tentativa de buscar o transportador.",
        },
      },
      { status: 500 },
    );
  }
}
