export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ProductType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload || !payload.companyId) {
      return NextResponse.json(
        { error: "Token inválido ou sem companyId" },
        { status: 401 }
      );
    }

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
        companyId: payload.companyId,
        product: productType as ProductType,
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
