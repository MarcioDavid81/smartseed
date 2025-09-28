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
  const cycleId = req.nextUrl.searchParams.get("cycleId");

  try {
    const receivables = await db.accountReceivable.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      orderBy: { dueDate: "desc" },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        saleExit: {
          select: {
            id: true,
            invoiceNumber: true,
            saleValue: true,
            cultivar: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(receivables, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar recebíveis" },
      { status: 500 },
    );
  }
}
