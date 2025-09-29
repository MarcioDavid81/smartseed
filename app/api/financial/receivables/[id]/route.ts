import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { status, paymentDate } = await req.json();

    // Validar status recebido conforme enum AccountStatus
    const validStatuses: Array<"PAID" | "PENDING" | "OVERDUE"> = [
      "PAID",
      "PENDING",
      "OVERDUE",
    ];
    if (!validStatuses.includes(status)) {
      return new NextResponse("Status inválido", { status: 400 });
    }

    // Garantir que pertence à empresa do usuário
    const existing = await db.accountReceivable.findUnique({ where: { id } });
    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Recebível não encontrado ou acesso negado", {
        status: 403,
      });
    }
    const updated = await db.accountReceivable.update({
      where: { id },
      data: {
        status,
        receivedDate: status === "PAID" ? (paymentDate ?? new Date()) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar recebível:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o recebível para garantir que pertence à empresa do usuário
    const existing = await db.accountReceivable.findUnique({ where: { id } });
    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Recebível não encontrado ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(existing);
  } catch (error) {
    console.error("Erro ao buscar recebível:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
