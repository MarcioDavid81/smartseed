import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { industryDepositSchema } from "@/lib/schemas/industryDepositSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {  
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl('CREATE_MASTER_DATA');
    
    const body = await req.json();
    const { name } = industryDepositSchema.parse(body);

    if (!name) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: "O nome do depósito é obrigatório.",
          },
        },
        { status: 400 },
      );
    }

    const industryDeposit = await db.industryDeposit.create({
      data: {
        name,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(industryDeposit, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar depósito:", error);
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
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const industryDeposits = await db.industryDeposit.findMany({
      where: { companyId },
      include: {
        industryStocks: {
          select: {
            product: true,
            quantity: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(industryDeposits, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
