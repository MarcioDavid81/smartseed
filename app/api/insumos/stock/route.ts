import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
        { status: 401 },
      );
    }

    const stock = await db.productStock.findMany({
      where: {
        companyId: payload.companyId,
        stock: {
          gt: 0,
        },
      },
      include: {
        product: true, // para trazer nome, unidade, classe, etc.
        farm: true,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar estoque" },
      { status: 500 },
    );
  }
}
