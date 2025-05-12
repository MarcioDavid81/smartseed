import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

export async function GET(req: NextRequest) {
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
    const type = searchParams.get("type");

    if (!type) {
      return new NextResponse("Tipo de produto não informado", { status: 400 });
    }

    // Buscar cultivares da empresa do usuário, filtrando pelo tipo
    const productType = type as ProductType;
    const cultivares = await db.cultivar.findMany({
      where: {
        product: productType, // campo correto do model
        companyId: payload.companyId,
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
