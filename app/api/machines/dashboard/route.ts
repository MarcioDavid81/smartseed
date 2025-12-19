export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
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

    // 🔁 Executa tudo em paralelo (mais rápido)
    const [totalMachines, fuelStockAgg, fuelPurchaseAgg, maintenanceAgg] =
      await Promise.all([
        db.machine.count({
          where: { companyId },
        }),

        db.fuelTank.aggregate({
          where: { companyId },
          _sum: { stock: true },
        }),

        db.fuelPurchase.aggregate({
          where: { companyId },
          _sum: { totalValue: true },
        }),

        db.maintenance.aggregate({
          where: { companyId },
          _sum: { totalValue: true },
        }),
      ]);

    return NextResponse.json({
      totalMachines,
      totalFuelStock: fuelStockAgg._sum.stock ?? 0,
      totalFuelCost: fuelPurchaseAgg._sum.totalValue ?? 0,
      totalMaintenanceCost: maintenanceAgg._sum.totalValue ?? 0,
    });
  } catch (error) {
    console.error("Erro no dashboard de máquinas:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dashboard de máquinas" },
      { status: 500 },
    );
  }
}
