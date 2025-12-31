import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
        if (!auth.ok) return auth.response;
        const { companyId } = auth;
    
        const { id } = params;

    // 🧠 Máquina
    const machine = await db.machine.findFirst({
      where: {
        id: id,
        companyId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!machine) {
      return NextResponse.json(
        { error: "Máquina não encontrada" },
        { status: 404 },
      );
    }

    // Preço do combustível
    const fuelPurchases = await db.fuelPurchase.findMany({
      where: {
        companyId,
      },
      select: {
        quantity: true,
        totalValue: true,
      },
    });

    if (!fuelPurchases) {
      return NextResponse.json(
        { error: "Compra do combustível não encontrada" },
        { status: 404 },
      );
    }

    const totalFuelLiters = fuelPurchases.reduce(
      (acc, p) => acc + Number(p.quantity),
      0,
    );

    const totalFuelCost = fuelPurchases.reduce(
      (acc, p) => acc + Number(p.totalValue),
      0,
    );

    const averageFuelPrice =
      totalFuelLiters > 0 ? totalFuelCost / totalFuelLiters : 0;

    // ⛽ Abastecimentos
    const refuels = await db.refuel.findMany({
      where: {
        machineId: id,
        companyId,
      },
      select: {
        date: true,
        quantity: true,
      },
    });

    // 🔧 Manutenções
    const maintenances = await db.maintenance.findMany({
      where: {
        machineId: id,
        companyId,
      },
      select: {
        date: true,
        totalValue: true,
      },
    });

    // 📊 Agregação mensal
    const monthlyMap = new Map<string, { fuel: number; maintenance: number }>();

    const getMonth = (date: Date) => MONTHS[date.getMonth()];

    refuels.forEach((r) => {
      const month = getMonth(r.date);
      const cost = Number(r.quantity) * averageFuelPrice;

      const current = monthlyMap.get(month) ?? {
        fuel: 0,
        maintenance: 0,
      };

      current.fuel += cost;
      monthlyMap.set(month, current);
    });

    maintenances.forEach((m) => {
      const month = getMonth(m.date);
      const current = monthlyMap.get(month) ?? { fuel: 0, maintenance: 0 };
      current.maintenance += Number(m.totalValue);
      monthlyMap.set(month, current);
    });

    const monthly = Array.from(monthlyMap.entries()).map(([month, values]) => ({
      month,
      fuel: values.fuel,
      maintenance: values.maintenance,
    }));

    const liters = refuels.reduce(
      (acc, r) => acc + Number(r.quantity),
      0,
    );

    // 💰 Totais
    const totalFuelByMachine = refuels.reduce(
      (acc, r) => acc + Number(r.quantity) * averageFuelPrice,
      0,
    );

    const totalMaintenance = maintenances.reduce(
      (acc, m) => acc + Number(m.totalValue),
      0,
    );

    return NextResponse.json({
      machine,
      totals: {
        fuel: totalFuelByMachine,
        liters,
        maintenance: totalMaintenance,
        total: totalFuelByMachine + totalMaintenance,
      },
      monthly,
    });
  } catch (error) {
    console.error("Erro dashboard máquina:", error);
    return NextResponse.json(
      { error: "Erro ao gerar dashboard da máquina" },
      { status: 500 },
    );
  }
}
