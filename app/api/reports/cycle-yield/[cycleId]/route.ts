import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/reports/cycle-yield/[cycleId]
 * Retorna relatório consolidado de produtividade por ciclo
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { cycleId: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token)
      return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload)
      return new NextResponse("Token inválido", { status: 401 });

    const { cycleId } = params;

    // Buscar colheitas de semente
    const harvests = await db.harvest.findMany({
      where: { cycleId, companyId: payload.companyId },
      include: {
        talhao: {
          select: {
            id: true,
            name: true,
            area: true,
          },
        },
        cultivar: {
          select: {
            id: true,
            name: true,
            product: true, // 👈 importante!
          },
        },
      },
    });

    // Buscar colheitas de indústria
    const industryHarvests = await db.industryHarvest.findMany({
      where: { cycleId, companyId: payload.companyId },
      include: {
        talhao: {
          select: {
            id: true,
            name: true,
            area: true,
          },
        },
      },
    });

    // Unificar colheitas
    const allHarvests = [
      ...harvests.map((h) => ({
        talhaoId: h.talhao.id,
        talhaoName: h.talhao.name,
        productType: h.cultivar.product, // ✅ agora vem SOJA/TRIGO/MILHO
        quantityKg: Number(h.quantityKg),
        areaHa: Number(h.talhao.area),
      })),
      ...industryHarvests.map((h) => ({
        talhaoId: h.talhao.id,
        talhaoName: h.talhao.name,
        productType: h.product, // ✅ industryHarvest já tem o campo productType
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
    const grouped = allHarvests.reduce((acc, h) => {
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

    // Gerar relatórios por talhão
    const fieldReports = Object.values(grouped).map((f: any) => ({
      talhaoId: f.talhaoId,
      talhaoName: f.talhaoName,
      productType: f.productType,
      totalKg: f.totalKg,
      totalSc: f.totalKg / 60,
      areaHa: f.areaHa,
      productivityKgHa:
        f.areaHa && f.areaHa > 0 ? f.totalKg / f.areaHa : null,
      productivityScHa:
        f.areaHa && f.areaHa > 0 ? (f.totalKg / 60) / f.areaHa : null,
    }));

    // Totais gerais
    const totalKg = fieldReports.reduce((sum, f) => sum + f.totalKg, 0);
    const totalArea = fieldReports.reduce((sum, f) => sum + (f.areaHa ?? 0), 0);

    const summary = {
      totalKg,
      totalSc: totalKg / 60,
      totalAreaHa: totalArea || null,
      avgProductivityKgHa:
        totalArea > 0 ? totalKg / totalArea : null,
      avgProductivityScHa:
        totalArea > 0 ? (totalKg / 60) / totalArea : null,
    };

    // Adiciona % de participação de cada talhão
    const enrichedReports = fieldReports.map((f) => ({
      ...f,
      participationPercent:
        totalKg > 0 ? (f.totalKg / totalKg) * 100 : 0,
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
