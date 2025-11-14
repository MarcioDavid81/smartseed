import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ProductType } from "@prisma/client";

/**
 * GET /api/reports/cycle-yield/[cycleId]
 * Retorna relatório consolidado de produtividade por ciclo
 */

type HarvestGroup = {
  talhaoId: string;
  talhaoName: string;
  productType: ProductType;
  totalKg: number;
  areaHa: number;
};

type FieldReport = {
  talhaoId: string;
  talhaoName: string;
  productType: ProductType;
  totalKg: number;
  totalSc: number;
  areaHa: number;
  productivityKgHa: number | null;
  productivityScHa: number | null;
  participationPercent: number;
};

/** Peso por saca (kg) para cada produto */
const KG_PER_SC: Record<ProductType, number> = {
  SOJA: 60,
  TRIGO: 60,
  MILHO: 60,
  AVEIA_BRANCA: 40,
  AVEIA_PRETA: 40,
  AVEIA_UCRANIANA: 40,
  AZEVEM: 25,
};

export async function GET(
  req: NextRequest,
  { params }: { params: { cycleId: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { cycleId } = params;

    // Buscar colheitas de semente
    const harvests = await db.harvest.findMany({
      where: { cycleId, companyId: payload.companyId },
      include: {
        talhao: { select: { id: true, name: true, area: true } },
        cultivar: { select: { id: true, name: true, product: true } },
      },
    });

    // Buscar colheitas de indústria
    const industryHarvests = await db.industryHarvest.findMany({
      where: { cycleId, companyId: payload.companyId },
      include: {
        talhao: { select: { id: true, name: true, area: true } },
      },
    });

    // Unificar colheitas
    const allHarvests = [
      ...harvests.map((h) => ({
        talhaoId: h.talhao.id,
        talhaoName: h.talhao.name,
        productType: h.cultivar.product,
        quantityKg: Number(h.quantityKg),
        areaHa: Number(h.talhao.area),
      })),
      ...industryHarvests.map((h) => ({
        talhaoId: h.talhao.id,
        talhaoName: h.talhao.name,
        productType: h.product,
        quantityKg: Number(h.weightLiq),
        areaHa: Number(h.talhao.area),
      })),
    ];

    if (allHarvests.length === 0) {
      return NextResponse.json({
        summary: null,
        fieldReports: [],
        message: "Nenhuma colheita encontrada para este ciclo.",
      });
    }

    // Agrupar por talhão e produto
    const grouped = allHarvests.reduce(
      (acc, h) => {
        const key = `${h.talhaoId}-${h.productType}`;

        if (!acc[key]) {
          acc[key] = {
            talhaoId: h.talhaoId,
            talhaoName: h.talhaoName,
            productType: h.productType,
            totalKg: 0,
            areaHa: h.areaHa,
          };
        }

        acc[key].totalKg += h.quantityKg;

        return acc;
      },
      {} as Record<string, HarvestGroup>,
    );

    // Gerar relatórios por talhão
    const fieldReports: FieldReport[] = Object.values(grouped).map((f) => {
      const kgPerSc = KG_PER_SC[f.productType];
      const totalSc = f.totalKg / kgPerSc;

      return {
        talhaoId: f.talhaoId,
        talhaoName: f.talhaoName,
        productType: f.productType,
        totalKg: f.totalKg,
        totalSc,
        areaHa: f.areaHa,
        productivityKgHa: f.areaHa ? f.totalKg / f.areaHa : null,
        productivityScHa: f.areaHa ? totalSc / f.areaHa : null,
        participationPercent: 0,
      };
    });

    // Totais gerais
    const totalKg = fieldReports.reduce((sum, f) => sum + f.totalKg, 0);
    const totalSc = fieldReports.reduce((sum, f) => sum + f.totalSc, 0);
    const totalArea = fieldReports.reduce((sum, f) => sum + (f.areaHa ?? 0), 0);

    const summary = {
      totalKg,
      totalSc,
      totalAreaHa: totalArea || null,
      avgProductivityKgHa: totalArea > 0 ? totalKg / totalArea : null,
      avgProductivityScHa: totalArea > 0 ? totalSc / totalArea : null,
    };

    // Adiciona % de participação de cada talhão
    const enrichedReports: FieldReport[] = fieldReports.map((f) => ({
      ...f,
      participationPercent: totalKg > 0 ? (f.totalKg / totalKg) * 100 : 0,
    }));

    return NextResponse.json({
      summary,
      fieldReports: enrichedReports,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de ciclo:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
