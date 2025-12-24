import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;
  const { searchParams } = new URL(req.url);
  const cultivarId = searchParams.get("cultivar");

  if (!cultivarId) {
    return NextResponse.json(
      { error: "Cultivar ID obrigatório" },
      { status: 400 },
    );
  }

  try {
    const colheitas = await db.harvest.findMany({
      where: {
        cultivarId,
        companyId,
      },
      select: {
        quantityKg: true,
      },
    });

    const beneficiamentos = await db.beneficiation.findMany({
      where: {
        cultivarId,
        companyId,
      },
      select: {
        quantityKg: true,
        type: true,
      },
    });

    const ajustes = await db.seedStockAdjustment.findMany({
      where: {
        cultivarId,
        companyId,
      },
      select: {
        quantityKg: true,
      },
    });

    const colheitaKg = colheitas.reduce((acc, c) => acc + c.quantityKg, 0);
    const beneficiamentoKg = beneficiamentos
      .filter((b) => b.type !== "Descarte")
      .reduce((acc, b) => acc + b.quantityKg, 0);
    const descarteKg = beneficiamentos
      .filter((b) => b.type === "Descarte")
      .reduce((acc, b) => acc + b.quantityKg, 0);
    const ajusteKg = ajustes.reduce((acc, a) => acc + a.quantityKg, 0);

    const chartData = [
      { name: "Colheita", value: colheitaKg },
      { name: "Beneficiado", value: beneficiamentoKg },
      { name: "Descarte", value: descarteKg },
      { name: "Ajuste", value: ajusteKg },
    ];

    return NextResponse.json({
      totalCultivar: colheitaKg,
      totalDescarte: descarteKg,
      totalAjuste: ajusteKg,
      beneficiamentoKg,
      colheitaKg,
      chartData,
    });
  } catch (error) {
    console.error("Erro ao gerar dados do dashboard:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
