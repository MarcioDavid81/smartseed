import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {  
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Nome do depósito é obrigatório" },
        { status: 400 },
      );
    }

    const industryDeposit = await db.industryDeposit.create({
      data: {
        name,
        companyId,
      },
    });

    return NextResponse.json(industryDeposit, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar depósito:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const industryDeposits = await db.industryDeposit.findMany({
      where: { companyId },
      include: {
        industryStocks: {
          select: {
            product: true,
            quantity: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(industryDeposits, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
