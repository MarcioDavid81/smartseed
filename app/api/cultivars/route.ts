import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canCompanyAddCultivar } from "@/lib/permissions/canCompanyAddSeed";
import { ProductType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";

const cultivarSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  product: z.nativeEnum(ProductType),
});

export async function POST(req: Request) {
  const allowed = await canCompanyAddCultivar();
  if (!allowed) {
    return Response.json(
      {
        error:
          "Limite de registros atingido para seu plano. Faça upgrade para continuar.",
      },
      { status: 403 },
    );
  }

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

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

  try {
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
        companyId,
      },
    });

    return NextResponse.json(cultivar, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar cultivar:", err);
    return NextResponse.json(
      { error: "Erro ao criar cultivar" },
      { status: 500 },
    );
  }
}
