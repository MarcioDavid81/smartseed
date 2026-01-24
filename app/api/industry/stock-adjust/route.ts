import { getOrCreateIndustryStock } from "@/app/_helpers/getOrCreateIndustryStock";
import { validateIndustryStockForOutput } from "@/app/_helpers/validateIndustryStockForOutput";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { industryAdjustmentSchema } from "@/lib/schemas/industryAdjustStockSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "REGISTER_MOVEMENT",
    });

    const body = await req.json();
    const parsed = industryAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          title: "Dados inválidos",
          message:
            "Os dados fornecidos são inválidos. Por favor, verifique e tente novamente.",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const adjusted = await db.$transaction(async (tx) => {
      if (data.quantityKg < 0) {
        await validateIndustryStockForOutput({
          companyId,
          industryDepositId: data.industryDepositId,
          product: data.product,
          quantityKg: data.quantityKg,
        });
      }

      const stock = await getOrCreateIndustryStock({
        tx,
        companyId,
        industryDepositId: data.industryDepositId,
        product: data.product,
      });

      const adjustment = await tx.industryStockAdjustment.create({
        data: {
          companyId,
          industryDepositId: data.industryDepositId,
          product: data.product,
          date: data.date,
          quantityKg: data.quantityKg,
          notes: data.notes,
        },
      });

      await tx.industryStock.update({
        where: { id: stock.id },
        data: {
          quantity: {
            increment: data.quantityKg,
          },
        },
      });
      return adjustment;
    });

    return NextResponse.json(adjusted, { status: 201 });
  } catch (error) {
    console.error("Erro ao ajustar estoque de sementes:", error);
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        title: "Erro interno do servidor",
        message:
          "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
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

    const adjustments = await db.industryStockAdjustment.findMany({
      where: { companyId },
      include: { industryDeposit: true },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Erro ao buscar ajustes de estoque de sementes:", error);
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        title: "Erro interno do servidor",
        message:
          "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
      },
      { status: 500 },
    );
  }
}
