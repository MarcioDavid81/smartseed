import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload || !payload.companyId) {
      return NextResponse.json(
        { error: "Token inválido ou sem companyId" },
        { status: 401 }
      );
    }

    const cultivars = await db.cultivar.findMany({
      where: {
        companyId: payload.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(cultivars);
  } catch (error) {
    console.error("Erro ao buscar cultivares:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
