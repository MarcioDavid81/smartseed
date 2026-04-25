import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { searchParams } = new URL(req.url);

    const farmId = searchParams.get("farmId");
    const productId = searchParams.get("productId");
    const showZero = searchParams.get("showZero") === "true";

    const stock = await db.productStock.findMany({
      where: {
        companyId,
        ...(farmId ? { farmId } : {}),
        ...(productId ? { productId } : {}),
        ...(showZero
          ? {} // traz tudo
          : { stock: { gt: 0 } }), // default continua otimizado
      },
      include: {
        product: true, // para trazer nome, unidade, classe, etc.
        farm: true,
      },
      orderBy: {
        product: {
          name: "asc",
        },
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
