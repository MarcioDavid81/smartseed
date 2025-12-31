import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { machineSchema } from "@/lib/schemas/machineSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    
    const session = await withAccessControl('CREATE_MASTER_DATA');

    const body = await req.json();

    const parsed = machineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: {
          code: "INVALID_DATA",
          title: "Dados inválidos",
          message: `${parsed.error.flatten().fieldErrors}`,
        } 
      },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const machine = await db.machine.create({
      data: {
        ...data,
        companyId: session.user.companyId,
      },
    });
    
    return NextResponse.json(machine, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar máquina:", error);
    if (error instanceof PlanLimitReachedError) {
          return NextResponse.json(
            { message: error.message },
            { status: 402 }
          )
        }
        
    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json({ error: {
      code: "CREATE_MACHINE_ERROR",
      title: "Erro ao criar máquina",
      message: "Ocorreu um erro ao criar a máquina. Por favor, tente novamente.",
    }
   },
    { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    
    const machines = await db.machine.findMany({
      where: {
        companyId,
      },
      include: {
        maintenances: true,
        refuels: true,
      }
    });

    return NextResponse.json(machines);
  } catch (error) {
    console.error("Erro ao buscar máquinas:", error);
    return NextResponse.json({ error: {
      code: "GET_MACHINES_ERROR",
      title: "Erro ao buscar máquinas",
      message: "Ocorreu um erro ao buscar as máquinas. Por favor, tente novamente.",
    } 
  },
   { status: 500 });
  }
}