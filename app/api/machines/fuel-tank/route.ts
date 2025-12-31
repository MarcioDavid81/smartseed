import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { fuelTankSchema } from "@/lib/schemas/fuelTankSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl("CREATE_MASTER_DATA");

    const body = await req.json();

    const parsed = fuelTankSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: `${parsed.error.flatten().fieldErrors}`,
          },
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const fuelTank = await db.fuelTank.create({
      data: {
        ...data,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(fuelTank, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tanque de combustível:", error);
    if (error instanceof PlanLimitReachedError) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }

    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json(
      {
        error: {
          code: "CREATE_FUEL_TANK_ERROR",
          title: "Erro ao criar tanque de combustível",
          message:
            "Ocorreu um erro ao criar o tanque de combustível. Por favor, tente novamente.",
        },
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const fuelTanks = await db.fuelTank.findMany({
      where: {
        companyId,
      },
      include: {
        purchases: true,
        refuels: true,
      },
    });

    return NextResponse.json(fuelTanks);
  } catch (error) {
    console.error("Erro ao buscar tanques de combustível:", error);
    return NextResponse.json(
      {
        error: {
          code: "GET_FUEL_TANKS_ERROR",
          title: "Erro ao buscar tanques de combustível",
          message:
            "Ocorreu um erro ao buscar os tanques de combustível. Por favor, tente novamente.",
        },
      },
      { status: 500 },
    );
  }
}
