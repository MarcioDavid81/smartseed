import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { machineSchema } from "@/lib/schemas/machineSchema";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const machine = await db.machine.findUnique({
      where: {
        id: params.id,
        companyId,
      },
    });

    if (!machine) {
      return NextResponse.json(
        { error: {
          code: "MACHINE_NOT_FOUND",
          title: "Máquina não encontrada",
          message: "A máquina com o ID fornecido não foi encontrada.",
        } 
      },
        { status: 404 },
      );
    }

    const data = await req.json();
    const parsed = machineSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: {
        code: "INVALID_DATA",
        title: "Dados inválidos",
        message: `${parsed.error.flatten().fieldErrors}`,
      } 
    },
    { status: 400 });
    }
    const updated = await db.machine.update({
      where: {
        id: params.id,
        companyId,
      },
      data: parsed.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar máquina:", error);
    return NextResponse.json(
      {
        error: {
          code: "UPDATE_MACHINE_ERROR",
          title: "Erro ao atualizar máquina",
          message:
            "Ocorreu um erro inesperado durante a tentativa de atualizar a máquina.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const existing = await db.machine.findUnique({
      where: {
        id,
        companyId,
      },
      include: {
        maintenances: true,
        refuels: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "MACHINE_NOT_FOUND",
            title: "Máquina não encontrada",
            message:
              "A máquina não foi encontrada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    if (existing.maintenances.length > 0 || existing.refuels.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "MACHINE_HAS_MAINTENANCES",
            title: "Máquina possui relações",
            message:
              "A máquina não pode ser deletada enquanto houver manutenções associadas.",
          },
        },
        { status: 400 },
      );
    }

    if (existing.refuels.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "MACHINE_HAS_REFUELS",
            title: "Máquina possui relações",
            message:
              "A máquina não pode ser deletada enquanto houver abastecimentos associados.",
          },
        },
        { status: 400 },
      );
    }

    const deleted = await db.machine.delete({
      where: {
        id,
        companyId,
      },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar máquina:", error);
    return NextResponse.json(
      {
        error: {
          code: "DELETE_MACHINE_ERROR",
          title: "Erro ao deletar máquina",
          message:
            "Ocorreu um erro inesperado durante a tentativa de deletar a máquina.",
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

    const existing = await db.machine.findUnique({
      where: {  
        id,
        companyId,
      },
      include: {
        maintenances: true,
        refuels: true,
      },
    });
    
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "MACHINE_NOT_FOUND",
            title: "Máquina não encontrada",
            message:
              "A máquina não foi encontrada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar máquina:", error);
    return NextResponse.json(
      {
        error: {
          code: "GET_MACHINE_ERROR",
          title: "Erro ao buscar máquina",
          message:
            "Ocorreu um erro inesperado durante a tentativa de buscar a máquina.",
        },
      },
      { status: 500 },
    );
  }
}
