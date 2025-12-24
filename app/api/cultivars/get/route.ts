export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const cultivars = await db.cultivar.findMany({
      where: {
        companyId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(cultivars);
  } catch (error) {
    console.error("Erro ao buscar cultivares:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
