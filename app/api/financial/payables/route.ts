import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(req: NextRequest) {  
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const cycleId = req.nextUrl.searchParams.get("cycleId");
    
    const payables = await db.accountPayable.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      orderBy: { dueDate: "desc" },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        buy: {
          select: {
            id: true,
            invoice: true,
            unityPrice: true,
            quantityKg: true,
            totalPrice: true,
            cultivar: { select: { id: true, name: true } },
          },
        },
        purchase: {
          select: {
            id: true,
            invoiceNumber: true,
            unitPrice: true,
            quantity: true,
            totalPrice: true,
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(payables, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos" },
      { status: 500 },
    );
  }
}