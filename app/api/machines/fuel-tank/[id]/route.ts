import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { fuelTankSchema } from "@/lib/schemas/fuelTankSchema";
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

    const fuelTank = await db.fuelTank.findUnique({
      where: {
        id,
        companyId,
      },
    });

    if (!fuelTank) {
      return NextResponse.json(
        { error: {
          code: "FUEL_TANK_NOT_FOUND",
          title: "Tanque de combustível não encontrado",
          message: "O tanque de combustível com o ID fornecido não foi encontrado.",
        } 
      },
        { status: 404 },
      );
    }

    const data = await req.json();
    const parsed = fuelTankSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: {
        code: "INVALID_DATA",
        title: "Dados inválidos",
        message: `${parsed.error.flatten().fieldErrors}`,
      } 
    },
    { status: 400 });
    }
    const updated = await db.fuelTank.update({
      where: {
        id: params.id,
        companyId,
      },
      data: parsed.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar tanque de combustível:", error);
    return NextResponse.json(
      {
        error: {
          code: "UPDATE_FUEL_TANK_ERROR",
          title: "Erro ao atualizar tanque de combustível",
          message:
            "Ocorreu um erro inesperado durante a tentativa de atualizar o tanque de combustível.",
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

    const existing = await db.fuelTank.findUnique({
      where: {
        id,
        companyId,
      },
      include: {
        purchases: true,
        refuels: true,
      },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "FUEL_TANK_NOT_FOUND",
            title: "Tanque de combustível não encontrado",
            message:
              "O tanque de combustível não foi encontrado ou você não tem permissão para acessá-lo.",
          },
        },
        { status: 403 },
      );
    }

    if (existing.purchases.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "FUEL_TANK_HAS_PURCHASES",
            title: "Tanque de combustível possui relações",
            message:
              "O tanque de combustível não pode ser deletado enquanto houver compras associadas.",
          },
        },
        { status: 400 },
      );
    }

    if (existing.refuels.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "FUEL_TANK_HAS_REFUELS",
            title: "Tanque de combustível possui relações",
            message:
              "O tanque de combustível não pode ser deletado enquanto houver abastecimentos associados.",
          },
        },
        { status: 400 },
      );
    }

    if (existing.stock > 0) {
      return NextResponse.json(
        {
          error: {
            code: "FUEL_TANK_HAS_STOCK",
            title: "Tanque de combustível possui estoque",
            message:
              "O tanque de combustível não pode ser deletado enquanto houver estoque associado.",
          },
        },
        { status: 400 },
      );
    }

    const deleted = await db.fuelTank.delete({
      where: {
        id,
        companyId,
      },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar tanque de combustível:", error);
    return NextResponse.json(
      {
        error: {
          code: "DELETE_FUEL_TANK_ERROR",
          title: "Erro ao deletar tanque de combustível",
          message:
            "Ocorreu um erro inesperado durante a tentativa de deletar o tanque de combustível.",
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

    const existing = await db.fuelTank.findUnique({
      where: {  
        id,
        companyId,
      },
      include: {
        purchases: true,
        refuels: true,
      },
    });
    
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "FUEL_TANK_NOT_FOUND",
            title: "Tanque de combustível não encontrado",
            message:
              "O tanque de combustível não foi encontrado ou você não tem permissão para acessá-lo.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar tanque de combustível:", error);
    return NextResponse.json(
      {
        error: {
          code: "GET_FUEL_TANK_ERROR",
          title: "Erro ao buscar tanque de combustível",
          message:
            "Ocorreu um erro inesperado durante a tentativa de buscar o tanque de combustível.",
        },
      },
      { status: 500 },
    );
  }
}
