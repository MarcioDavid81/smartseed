import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

  const { searchParams } = new URL(req.url);
  const depositId = searchParams.get("depositId");
  const product = searchParams.get("product");

  try {
    const industryStocks = await db.industryStock.findMany({
      where: {
        companyId,
        quantity: { gt: 0 },
        ...(depositId ? { industryDepositId: depositId } : {}),
        ...(product ? { product: product as ProductType } : {}),
      },
      include: {
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
