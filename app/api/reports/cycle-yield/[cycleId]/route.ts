import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ProductType } from "@prisma/client";

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

type FarmReport = {
  farmId: string;
  farmName: string;
  totalKg: number;
  totalSc: number;
  totalAreaHa: number;
  productivityKgHa: number | null;
  productivityScHa: number | null;
  participationPercent: number;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { cycleId: string } },
) {
  try {
    // --- AUTH --------------------------------------------------
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { cycleId } = params;

    // --- BUSCA COLHEITAS DE SEMENTE ---------------------------------------
    const harvests = await db.harvest.findMany({
      where: { cycleId, companyId: payload.companyId },
      include: {
        talhao: {
          select: {
            id: true,
            name: true,
            area: true,
            farm: { select: { id: true, name: true } },
          },
        },
        cultivar: { select: { product: true } },
      },
    });

    // --- BUSCA COLHEITAS DE INDUSTRIA ------------------------------------
    const industryHarvests = await db.industryHarvest.findMany({
      where: { cycleId, companyId: payload.companyId },
      include: {
        talhao: {
          select: {
            id: true,
            name: true,
            area: true,
            farm: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Se não houver colheitas
    if (harvests.length === 0 && industryHarvests.length === 0) {
      return NextResponse.json({
        summary: null,
        fieldReports: [],
        farmReports: [],
        message: "Nenhuma colheita encontrada para este ciclo.",
      });
    }

    // --- NORMALIZAÇÃO ------------------------------------------
    const allHarvests = [
      ...harvests.map((h) => ({
        talhaoId: h.talhao.id,
        talhaoName: h.talhao.name,
        farmId: h.talhao.farm.id,
        farmName: h.talhao.farm.name,
        productType: h.cultivar.product,
        quantityKg: Number(h.quantityKg),
        areaHa: Number(h.talhao.area),
      })),
      ...industryHarvests.map((h) => ({
        talhaoId: h.talhao.id,
        talhaoName: h.talhao.name,
        farmId: h.talhao.farm.id,
        farmName: h.talhao.farm.name,
        productType: h.product,
        quantityKg: Number(h.weightLiq),
        areaHa: Number(h.talhao.area),
      })),
    ];

    // --- AGRUPAMENTO POR TALHÃO --------------------------------
    const groupedByField = allHarvests.reduce((acc, h) => {
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
    }, {} as Record<string, any>);

    const fieldReports: FieldReport[] = Object.values(groupedByField).map(
      (f) => {
        const kgPerSc = KG_PER_SC[f.productType as ProductType];
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
          participationPercent: 0, // preenchido depois
        };
      },
    );

    // --- RESUMO GERAL ------------------------------------------
    const totalKg = fieldReports.reduce((s, f) => s + f.totalKg, 0);
    const totalSc = fieldReports.reduce((s, f) => s + f.totalSc, 0);
    const totalArea = fieldReports.reduce((s, f) => s + f.areaHa, 0);

    const summary = {
      totalKg,
      totalSc,
      totalAreaHa: totalArea,
      avgProductivityKgHa: totalArea ? totalKg / totalArea : null,
      avgProductivityScHa: totalArea ? totalSc / totalArea : null,
    };

    // --- PARTICIPAÇÃO POR TALHÃO --------------------------------
    const enrichedFieldReports = fieldReports.map((f) => ({
      ...f,
      participationPercent: totalKg
        ? (f.totalKg / totalKg) * 100
        : 0,
    }));

    // --- AGRUPAMENTO POR FAZENDA --------------------------------
    const farmMap = new Map<string, FarmReport>();

    for (const h of allHarvests) {
      if (!farmMap.has(h.farmId)) {
        farmMap.set(h.farmId, {
          farmId: h.farmId,
          farmName: h.farmName,
          totalKg: 0,
          totalSc: 0,
          totalAreaHa: 0,
          productivityKgHa: null,
          productivityScHa: null,
          participationPercent: 0,
        });
      }

      const farm = farmMap.get(h.farmId)!;

      const kgPerSc = KG_PER_SC[h.productType];
      const sc = h.quantityKg / kgPerSc;

      farm.totalKg += h.quantityKg;
      farm.totalSc += sc;
      farm.totalAreaHa += h.areaHa;
    }

    const farmReports = Array.from(farmMap.values()).map((f) => ({
      ...f,
      productivityKgHa:
        f.totalAreaHa > 0 ? f.totalKg / f.totalAreaHa : null,
      productivityScHa:
        f.totalAreaHa > 0 ? f.totalSc / f.totalAreaHa : null,
      participationPercent:
        summary.totalKg > 0 ? (f.totalKg / summary.totalKg) * 100 : 0,
    }));

    // --- RETORNO FINAL ------------------------------------------
    return NextResponse.json({
      summary,
      fieldReports: enrichedFieldReports,
      farmReports,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de ciclo:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
