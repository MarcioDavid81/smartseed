import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(req: NextRequest) {  
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const cycleId = req.nextUrl.searchParams.get("cycleId");
    
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
