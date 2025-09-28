import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

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