export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { searchParams } = new URL(req.url);
    const productType = searchParams.get("productType");

    if (!productType) {
      return NextResponse.json(
        { error: "Tipo de produto não informado" },
        { status: 400 }
      );
    }

    const cultivars = await db.cultivar.findMany({
      where: {
        companyId,
        product: productType as ProductType,
        stock: {
          gt: 0,
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(cultivars);
  } catch (error) {
    console.error("Erro ao buscar cultivares disponíveis:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
