import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const industryStocks = await db.industryStock.findMany({
      where: { companyId, quantity: { gt: 0 } },
      include: {
        industryProduct: true,
        industryDeposit: true,
      },
    });

    return NextResponse.json(industryStocks, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar estoques:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
