import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const companies = await db.company.findMany({
      select: { id: true, name: true },
      where: {},
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
