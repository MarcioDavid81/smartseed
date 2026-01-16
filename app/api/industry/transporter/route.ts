import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { industryTransporterSchema } from "@/lib/schemas/industryTransporter";
import { withAccessControl } from "@/lib/api/with-access-control";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";

export async function POST (req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl('CREATE_MASTER_DATA');

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "CREATE_MASTER_DATA",
    });

    const body = await req.json();
    const parsed = industryTransporterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const industryTransporter = await db.industryTransporter.create({
      data: {
        ...data,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(industryTransporter, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transportador:", error);
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

export async function GET (req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    const industryTransporters = await db.industryTransporter.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(industryTransporters, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transportadores:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}