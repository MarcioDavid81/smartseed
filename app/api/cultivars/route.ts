import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canCompanyAddCultivar } from "@/lib/permissions/canCompanyAddSeed";
import { ProductType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";

const cultivarSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  product: z.nativeEnum(ProductType),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl("CREATE_MASTER_DATA");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "CREATE_MASTER_DATA",
    });
  
    const body = await req.json();
    const parsed = cultivarSchema.safeParse(body);
  
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: `Dados inválidos: ${errors}` },
        { status: 400 },
      );
    }
  
    const { name, product } = parsed.data;
    const existingCultivar = await db.cultivar.findFirst({
      where: {
        name,
        product,
        companyId,
      },
    });

    if (existingCultivar) {
      return NextResponse.json(
        { error: "Cultivar já cadastrada para esta empresa" },
        { status: 409 },
      );
    }

    const cultivar = await db.cultivar.create({
      data: {
        name,
        product,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(cultivar, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cultivar:", error);
    if (error instanceof PlanLimitReachedError) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }

    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
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
