export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return new NextResponse("Tipo de produto não informado", { status: 400 });
    }

    // Buscar cultivares da empresa do usuário, filtrando pelo tipo
    const productType = type as ProductType;
    const cultivares = await db.cultivar.findMany({
      where: {
        product: productType, // campo correto do model
        companyId: companyId,
      },
      select: {
        name: true,
        stock: true,
      },
    });

    const result = cultivares.map((c) => ({
      name: c.name,
      stock: c.stock,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar estoque por tipo:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
