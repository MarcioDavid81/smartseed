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

    const { searchParams } = new URL(req.url);
  const depositId = searchParams.get("depositId");
  const productId = searchParams.get("productId");

  try {
    const industryStocks = await db.industryStock.findMany({
      where: {
        companyId,
        quantity: { gt: 0 },
        ...(depositId ? { industryDepositId: depositId } : {}),
        ...(productId ? { productId } : {}),
      },
      include: {
        industryProduct: {
          select: {
            id: true,
            name: true,
          },
        },
        industryDeposit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        industryDeposit: {
          name: "asc",
        },
      }
    });

    return NextResponse.json(industryStocks, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar estoques:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
