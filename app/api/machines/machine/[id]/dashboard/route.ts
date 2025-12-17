import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";

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
    // 🔐 Auth
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { companyId } = payload;
    const machineId = params.id;

    // 🧠 Máquina
    const machine = await db.machine.findFirst({
      where: {
        id: machineId,
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
        machineId,
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
        machineId,
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
