import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { AccountStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type NumberByKey = Record<string, number>;

const sumByKey = (base: NumberByKey, key: string, value: number) => {
  base[key] = (base[key] ?? 0) + (Number.isFinite(value) ? value : 0);
};

const round2 = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(2)) : 0;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId") ?? undefined;

    const cycles = await db.productionCycle.findMany({
      where: cycleId
        ? { id: cycleId, companyId }
        : { companyId, isActive: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
        productType: true,
        talhoes: {
          select: {
            talhao: {
              select: {
                id: true,
                area: true,
                farmId: true,
              },
            },
          },
        },
      },
    });

    if (cycleId && cycles.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message: "Ciclo não encontrado ou não pertence à empresa do usuário",
          },
        },
        { status: 404 },
      );
    }

    const cycleIds = cycles.map((c) => c.id);
    const hasSingleCycle = cycles.length === 1;
    const cycleDateRange = hasSingleCycle
      ? { gte: cycles[0].startDate, lte: cycles[0].endDate }
      : undefined;

    const [
      farms,
      talhoes,
      customersCount,
      productsCount,
      cultivars,
      machinesCount,
      machinesByType,
      fuelTanks,
      seedStockByProduct,
      industryStockByProduct,
      inputStocks,
      seedHarvests,
      industryHarvestAgg,
      seedPurchasesAgg,
      inputPurchasesAgg,
      fuelPurchasesAgg,
      maintenancesAgg,
      seedSalesAgg,
      industrySalesAgg,
      applicationsCount,
      refuelsAgg,
      rainsAgg,
      saleContractsByStatus,
      purchaseOrdersByStatus,
      accountsPayableByStatus,
      accountsReceivableByStatus,
    ] = await Promise.all([
      db.farm.findMany({
        where: { companyId },
        select: { id: true, name: true, area: true },
      }),
      db.talhao.findMany({
        where: { companyId },
        select: { id: true, farmId: true, area: true },
      }),
      db.customer.count({ where: { companyId } }),
      db.product.count({ where: { companyId } }),
      db.cultivar.findMany({
        where: { companyId },
        select: { id: true, product: true, stock: true },
      }),
      db.machine.count({ where: { companyId } }),
      db.machine.groupBy({
        by: ["type"],
        where: { companyId },
        _count: { _all: true },
      }),
      db.fuelTank.findMany({
        where: { companyId },
        select: { id: true, name: true, capacity: true, stock: true },
      }),
      db.cultivar.groupBy({
        by: ["product"],
        where: { companyId },
        _sum: { stock: true },
        _count: { _all: true },
      }),
      db.industryStock.groupBy({
        by: ["product"],
        where: { companyId },
        _sum: { quantity: true },
      }),
      db.productStock.findMany({
        where: { companyId },
        select: {
          stock: true,
          product: { select: { class: true } },
        },
      }),
      db.harvest.findMany({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        select: {
          quantityKg: true,
          cultivar: { select: { product: true } },
        },
      }),
      db.industryHarvest.groupBy({
        by: ["product"],
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        _sum: { weightLiq: true },
      }),
      db.buy.aggregate({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        _sum: { totalPrice: true, quantityKg: true },
        _count: { _all: true },
      }),
      db.purchase.aggregate({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        _sum: { totalPrice: true, quantity: true },
        _count: { _all: true },
      }),
      db.fuelPurchase.aggregate({
        where: {
          companyId,
          ...(cycleDateRange ? { date: cycleDateRange } : {}),
        },
        _sum: { totalValue: true, quantity: true },
        _count: { _all: true },
      }),
      db.maintenance.aggregate({
        where: {
          companyId,
          ...(cycleDateRange ? { date: cycleDateRange } : {}),
        },
        _sum: { totalValue: true },
        _count: { _all: true },
      }),
      db.saleExit.aggregate({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        _sum: { saleValue: true, quantityKg: true },
        _count: { _all: true },
      }),
      db.industrySale.aggregate({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      db.application.count({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
      }),
      db.refuel.aggregate({
        where: {
          companyId,
          ...(cycleDateRange ? { date: cycleDateRange } : {}),
        },
        _sum: { quantity: true },
        _count: { _all: true },
      }),
      db.rain.aggregate({
        where: {
          companyId,
          ...(cycleDateRange ? { date: cycleDateRange } : {}),
        },
        _sum: { quantity: true },
        _count: { _all: true },
      }),
      db.saleContract.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { _all: true },
      }),
      db.purchaseOrder.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { _all: true },
      }),
      db.accountPayable.groupBy({
        by: ["status"],
        where: { companyId },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      db.accountReceivable.groupBy({
        by: ["status"],
        where: { companyId },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const farmsTotalHa = farms.reduce((acc, f) => acc + (f.area ?? 0), 0);
    const talhoesTotalHa = talhoes.reduce((acc, t) => acc + (t.area ?? 0), 0);

    const plantedAreaByProductHa: NumberByKey = {};
    for (const cycle of cycles) {
      const key = cycle.productType ?? "UNKNOWN";
      const area = cycle.talhoes.reduce(
        (acc, ct) => acc + (ct.talhao.area ?? 0),
        0,
      );
      sumByKey(plantedAreaByProductHa, key, area);
    }
    const plantedAreaTotalHa = Object.values(plantedAreaByProductHa).reduce(
      (acc, v) => acc + v,
      0,
    );

    const seedHarvestKgByProduct: NumberByKey = {};
    for (const h of seedHarvests) {
      sumByKey(seedHarvestKgByProduct, String(h.cultivar.product), h.quantityKg);
    }

    const industryHarvestKgByProduct: NumberByKey = {};
    for (const row of industryHarvestAgg) {
      sumByKey(
        industryHarvestKgByProduct,
        String(row.product),
        Number(row._sum.weightLiq ?? 0),
      );
    }

    const totalHarvestKgByProduct: NumberByKey = {};
    for (const [k, v] of Object.entries(seedHarvestKgByProduct)) {
      sumByKey(totalHarvestKgByProduct, k, v);
    }
    for (const [k, v] of Object.entries(industryHarvestKgByProduct)) {
      sumByKey(totalHarvestKgByProduct, k, v);
    }

    const inputStockByClass: NumberByKey = {};
    for (const s of inputStocks) {
      sumByKey(inputStockByClass, String(s.product.class), s.stock);
    }

    const financial = {
      expenses: {
        inputsPurchases: {
          count: inputPurchasesAgg._count._all,
          quantity: round2(inputPurchasesAgg._sum.quantity ?? 0),
          total: round2(inputPurchasesAgg._sum.totalPrice ?? 0),
        },
        seedPurchases: {
          count: seedPurchasesAgg._count._all,
          quantityKg: round2(seedPurchasesAgg._sum.quantityKg ?? 0),
          total: round2(seedPurchasesAgg._sum.totalPrice ?? 0),
        },
        fuelPurchases: {
          count: fuelPurchasesAgg._count._all,
          quantityLiters: round2(fuelPurchasesAgg._sum.quantity ?? 0),
          total: round2(fuelPurchasesAgg._sum.totalValue ?? 0),
        },
        maintenances: {
          count: maintenancesAgg._count._all,
          total: round2(maintenancesAgg._sum.totalValue ?? 0),
        },
      },
      revenue: {
        seedSales: {
          count: seedSalesAgg._count._all,
          quantityKg: round2(seedSalesAgg._sum.quantityKg ?? 0),
          total: round2(seedSalesAgg._sum.saleValue ?? 0),
        },
        industrySales: {
          count: industrySalesAgg._count._all,
          total: round2(industrySalesAgg._sum.totalPrice ?? 0),
        },
      },
      accountsPayableByStatus: accountsPayableByStatus.map((r) => ({
        status: r.status,
        count: r._count._all,
        total: round2(r._sum.amount ?? 0),
      })),
      accountsReceivableByStatus: accountsReceivableByStatus.map((r) => ({
        status: r.status,
        count: r._count._all,
        total: round2(r._sum.amount ?? 0),
      })),
    };

    const now = new Date();
    const dueSoonDays = 7;
    const dueSoonDate = new Date(now);
    dueSoonDate.setDate(now.getDate() + dueSoonDays);

    const seedLowStockThresholdKg = 100;

    const talhaoIdsInCycles = cycles.flatMap((c) =>
      c.talhoes.map((ct) => ct.talhao.id),
    );

    const [
      talhoesForKpis,
      seedHarvestsByTalhao,
      industryHarvestsByTalhao,
      beneficiationsAgg,
      payablesDueSoon,
      receivablesDueSoon,
      payablesOverdueCount,
      receivablesOverdueCount,
      lowSeedCultivars,
      outOfStockInputsCount,
      outOfStockInputs,
      lowStockInputs,
    ] = await Promise.all([
      db.talhao.findMany({
        where: {
          companyId,
          ...(talhaoIdsInCycles.length > 0
            ? { id: { in: talhaoIdsInCycles } }
            : {}),
        },
        select: { id: true, name: true, farmId: true, area: true },
      }),
      db.harvest.findMany({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        select: {
          talhaoId: true,
          quantityKg: true,
          cultivar: { select: { product: true } },
        },
      }),
      db.industryHarvest.findMany({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        select: { talhaoId: true, product: true, weightLiq: true },
      }),
      db.beneficiation.aggregate({
        where: {
          companyId,
          ...(cycleIds.length > 0 ? { cycleId: { in: cycleIds } } : {}),
        },
        _sum: { quantityKg: true },
        _count: { _all: true },
      }),
      db.accountPayable.findMany({
        where: {
          companyId,
          status: AccountStatus.PENDING,
          dueDate: { gte: now, lte: dueSoonDate },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          dueDate: true,
          status: true,
          customer: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      db.accountReceivable.findMany({
        where: {
          companyId,
          status: AccountStatus.PENDING,
          dueDate: { gte: now, lte: dueSoonDate },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          dueDate: true,
          status: true,
          customer: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      db.accountPayable.count({
        where: {
          companyId,
          status: { in: [AccountStatus.PENDING, AccountStatus.OVERDUE] },
          dueDate: { lt: now },
        },
      }),
      db.accountReceivable.count({
        where: {
          companyId,
          status: { in: [AccountStatus.PENDING, AccountStatus.OVERDUE] },
          dueDate: { lt: now },
        },
      }),
      db.cultivar.findMany({
        where: {
          companyId,
          stock: { gt: 0, lte: seedLowStockThresholdKg },
        },
        select: { id: true, name: true, product: true, stock: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      db.productStock.count({
        where: {
          companyId,
          stock: { lte: 0 },
        },
      }),
      db.productStock.findMany({
        where: {
          companyId,
          stock: { lte: 0 },
        },
        select: {
          stock: true,
          product: { select: { name: true, class: true, unit: true } },
          farm: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      db.productStock.findMany({
        where: {
          companyId,
          stock: { gt: 0, lte: 10 },
        },
        select: {
          stock: true,
          product: { select: { name: true, class: true, unit: true } },
          farm: { select: { id: true, name: true } },
        },
        orderBy: { stock: "asc" },
        take: 10,
      }),
    ]);

    const farmById = new Map(farms.map((f) => [f.id, f]));

    const productionKgByTalhao: NumberByKey = {};
    for (const h of seedHarvestsByTalhao) {
      sumByKey(productionKgByTalhao, h.talhaoId, h.quantityKg);
    }
    for (const h of industryHarvestsByTalhao) {
      sumByKey(productionKgByTalhao, h.talhaoId, Number(h.weightLiq ?? 0));
    }

    const productivityByTalhao = talhoesForKpis
      .map((t) => {
        const productionKg = productionKgByTalhao[t.id] ?? 0;
        const yieldKgPerHa = t.area > 0 ? productionKg / t.area : 0;
        return {
          talhaoId: t.id,
          talhaoName: t.name,
          farmId: t.farmId,
          farmName: farmById.get(t.farmId)?.name ?? null,
          areaHa: round2(t.area),
          productionKg: round2(productionKg),
          yieldKgPerHa: round2(yieldKgPerHa),
        };
      })
      .sort((a, b) => b.yieldKgPerHa - a.yieldKgPerHa);

    const productionByFarm: Record<string, { areaHa: number; productionKg: number }> = {};
    for (const t of productivityByTalhao) {
      const farmId = t.farmId;
      productionByFarm[farmId] = productionByFarm[farmId] ?? {
        areaHa: 0,
        productionKg: 0,
      };
      productionByFarm[farmId].areaHa += t.areaHa;
      productionByFarm[farmId].productionKg += t.productionKg;
    }

    const productivityByFarm = Object.entries(productionByFarm)
      .map(([farmId, v]) => ({
        farmId,
        farmName: farmById.get(farmId)?.name ?? null,
        areaHa: round2(v.areaHa),
        productionKg: round2(v.productionKg),
        yieldKgPerHa: round2(v.areaHa > 0 ? v.productionKg / v.areaHa : 0),
      }))
      .sort((a, b) => b.yieldKgPerHa - a.yieldKgPerHa);

    const seedHarvestTotalKg = Object.values(seedHarvestKgByProduct).reduce(
      (acc, v) => acc + v,
      0,
    );
    const beneficiatedKg = Number(beneficiationsAgg._sum.quantityKg ?? 0);
    const beneficiationRate =
      seedHarvestTotalKg > 0 ? beneficiatedKg / seedHarvestTotalKg : null;

    const revenueTotal =
      financial.revenue.seedSales.total + financial.revenue.industrySales.total;
    const expensesTotal =
      financial.expenses.inputsPurchases.total +
      financial.expenses.seedPurchases.total +
      financial.expenses.fuelPurchases.total +
      financial.expenses.maintenances.total;
    const operationalResult = revenueTotal - expensesTotal;
    const margin = revenueTotal > 0 ? operationalResult / revenueTotal : null;

    const payablesByStatus = Object.fromEntries(
      financial.accountsPayableByStatus.map((r) => [r.status, r]),
    ) as Record<string, { count: number; total: number }>;

    const receivablesByStatus = Object.fromEntries(
      financial.accountsReceivableByStatus.map((r) => [r.status, r]),
    ) as Record<string, { count: number; total: number }>;

    const cashIn = receivablesByStatus[AccountStatus.PAID]?.total ?? 0;
    const cashOut = payablesByStatus[AccountStatus.PAID]?.total ?? 0;
    const netCash = cashIn - cashOut;

    const avgFuelPricePerLiter =
      (fuelPurchasesAgg._sum.quantity ?? 0) > 0
        ? Number(fuelPurchasesAgg._sum.totalValue ?? 0) /
          Number(fuelPurchasesAgg._sum.quantity ?? 1)
        : 0;

    const [refuelByMachine, maintenanceByMachine] = await Promise.all([
      db.refuel.groupBy({
        by: ["machineId"],
        where: {
          companyId,
          ...(cycleDateRange ? { date: cycleDateRange } : {}),
        },
        _sum: { quantity: true },
      }),
      db.maintenance.groupBy({
        by: ["machineId"],
        where: {
          companyId,
          ...(cycleDateRange ? { date: cycleDateRange } : {}),
        },
        _sum: { totalValue: true },
      }),
    ]);

    const machineIdsForKpis = Array.from(
      new Set([
        ...refuelByMachine.map((r) => r.machineId),
        ...maintenanceByMachine.map((r) => r.machineId),
      ]),
    );

    const machinesForKpis = machineIdsForKpis.length
      ? await db.machine.findMany({
          where: { companyId, id: { in: machineIdsForKpis } },
          select: { id: true, name: true, type: true },
        })
      : [];

    const machineById = new Map(machinesForKpis.map((m) => [m.id, m]));

    const maintenanceTotalByMachineId = Object.fromEntries(
      maintenanceByMachine.map((r) => [
        r.machineId,
        Number(r._sum.totalValue ?? 0),
      ]),
    ) as Record<string, number>;

    const machinesOperationalCost = refuelByMachine
      .map((r) => {
        const liters = Number(r._sum.quantity ?? 0);
        const fuelCost = liters * avgFuelPricePerLiter;
        const maintenanceCost = maintenanceTotalByMachineId[r.machineId] ?? 0;
        const totalCost = fuelCost + maintenanceCost;
        const machine = machineById.get(r.machineId);
        return {
          machineId: r.machineId,
          name: machine?.name ?? null,
          type: machine?.type ?? null,
          fuelLiters: round2(liters),
          fuelCost: round2(fuelCost),
          maintenanceCost: round2(maintenanceCost),
          totalCost: round2(totalCost),
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost);

    const fuelByMachineType: NumberByKey = {};
    for (const row of machinesOperationalCost) {
      if (!row.type) continue;
      sumByKey(fuelByMachineType, String(row.type), row.fuelLiters);
    }

    const topMachineTypesByFuel = Object.entries(fuelByMachineType)
      .map(([type, fuelLiters]) => ({
        type,
        fuelLiters: round2(fuelLiters),
        estimatedFuelCost: round2(fuelLiters * avgFuelPricePerLiter),
      }))
      .sort((a, b) => b.fuelLiters - a.fuelLiters)
      .slice(0, 5);

    const fuelTanksLow = fuelTanks
      .filter((t) => (t.capacity ?? 0) > 0)
      .map((t) => ({
        id: t.id,
        name: t.name,
        capacity: round2(t.capacity),
        stock: round2(t.stock),
        fillPercent: round2(((t.stock ?? 0) / (t.capacity ?? 1)) * 100),
      }))
      .filter((t) => t.fillPercent <= 10)
      .sort((a, b) => a.fillPercent - b.fillPercent);

    const kpis = {
      productivity: {
        byTalhaoTop: productivityByTalhao.slice(0, 8),
        byTalhaoBottom: productivityByTalhao.slice(-8).reverse(),
        byFarmTop: productivityByFarm.slice(0, 8),
      },
      beneficiation: {
        count: beneficiationsAgg._count._all,
        quantityKg: round2(beneficiatedKg),
        rateVsSeedHarvestPercent:
          beneficiationRate === null ? null : round2(beneficiationRate * 100),
      },
      operational: {
        revenueTotal: round2(revenueTotal),
        expensesTotal: round2(expensesTotal),
        result: round2(operationalResult),
        marginPercent: margin === null ? null : round2(margin * 100),
      },
      cash: {
        received: round2(cashIn),
        paid: round2(cashOut),
        net: round2(netCash),
        payableOpen: round2(
          (payablesByStatus[AccountStatus.PENDING]?.total ?? 0) +
            (payablesByStatus[AccountStatus.OVERDUE]?.total ?? 0),
        ),
        receivableOpen: round2(
          (receivablesByStatus[AccountStatus.PENDING]?.total ?? 0) +
            (receivablesByStatus[AccountStatus.OVERDUE]?.total ?? 0),
        ),
      },
      alerts: {
        seedLowStockThresholdKg,
        lowSeedCultivars: lowSeedCultivars.map((c) => ({
          id: c.id,
          name: c.name,
          product: c.product,
          stockKg: round2(c.stock),
        })),
        inputsOutOfStock: outOfStockInputs.map((s) => ({
          farm: s.farm.name,
          product: s.product.name,
          class: s.product.class,
          unit: s.product.unit,
          stock: round2(s.stock),
        })),
        inputsLowStock: lowStockInputs.map((s) => ({
          farm: s.farm.name,
          product: s.product.name,
          class: s.product.class,
          unit: s.product.unit,
          stock: round2(s.stock),
        })),
        fuelTanksLow,
        accounts: {
          dueSoonDays,
          payablesDueSoon: payablesDueSoon.map((p) => ({
            id: p.id,
            description: p.description,
            amount: round2(p.amount),
            dueDate: p.dueDate,
            status: p.status,
            customer: p.customer.name,
          })),
          receivablesDueSoon: receivablesDueSoon.map((r) => ({
            id: r.id,
            description: r.description,
            amount: round2(r.amount),
            dueDate: r.dueDate,
            status: r.status,
            customer: r.customer.name,
          })),
          payablesOverdueCount,
          receivablesOverdueCount,
        },
      },
      machines: {
        averageFuelPricePerLiter: round2(avgFuelPricePerLiter),
        topMachineTypesByFuel,
        topMachinesByOperationalCost: machinesOperationalCost.slice(0, 5),
      },
    };

    const response = {
      scope: {
        cycleId: cycleId ?? null,
        cycles: cycles.map((c) => ({
          id: c.id,
          name: c.name,
          isActive: c.isActive,
          productType: c.productType ?? null,
          startDate: c.startDate,
          endDate: c.endDate,
        })),
      },
      counts: {
        farms: farms.length,
        talhoes: talhoes.length,
        customers: customersCount,
        products: productsCount,
        cultivars: cultivars.length,
        machines: machinesCount,
        machinesByType: machinesByType.map((m) => ({
          type: m.type,
          count: m._count._all,
        })),
        fuelTanks: fuelTanks.length,
      },
      areas: {
        farmsTotalHa: round2(farmsTotalHa),
        talhoesTotalHa: round2(talhoesTotalHa),
        plantedAreaTotalHa: round2(plantedAreaTotalHa),
        plantedAreaByProductHa: Object.fromEntries(
          Object.entries(plantedAreaByProductHa).map(([k, v]) => [k, round2(v)]),
        ),
      },
      production: {
        seedHarvestKgByProduct: Object.fromEntries(
          Object.entries(seedHarvestKgByProduct).map(([k, v]) => [k, round2(v)]),
        ),
        industryHarvestKgByProduct: Object.fromEntries(
          Object.entries(industryHarvestKgByProduct).map(([k, v]) => [k, round2(v)]),
        ),
        totalHarvestKgByProduct: Object.fromEntries(
          Object.entries(totalHarvestKgByProduct).map(([k, v]) => [k, round2(v)]),
        ),
      },
      stocks: {
        seedStockKgByProduct: seedStockByProduct.map((r) => ({
          product: r.product,
          cultivarsCount: r._count._all,
          stockKg: round2(r._sum.stock ?? 0),
        })),
        industryStockKgByProduct: industryStockByProduct.map((r) => ({
          product: r.product,
          stockKg: round2(Number(r._sum.quantity ?? 0)),
        })),
        inputStockByClass: Object.fromEntries(
          Object.entries(inputStockByClass).map(([k, v]) => [k, round2(v)]),
        ),
        fuel: {
          totalCapacityLiters: round2(
            fuelTanks.reduce((acc, t) => acc + (t.capacity ?? 0), 0),
          ),
          totalStockLiters: round2(
            fuelTanks.reduce((acc, t) => acc + (t.stock ?? 0), 0),
          ),
          tanks: fuelTanks.map((t) => ({
            id: t.id,
            name: t.name,
            capacity: round2(t.capacity),
            stock: round2(t.stock),
          })),
        },
      },
      operations: {
        applicationsCount,
        refuels: {
          count: refuelsAgg._count._all,
          quantityLiters: round2(refuelsAgg._sum.quantity ?? 0),
        },
        rains: {
          count: rainsAgg._count._all,
          quantity: round2(rainsAgg._sum.quantity ?? 0),
        },
      },
      commercial: {
        saleContractsByStatus: saleContractsByStatus.map((r) => ({
          status: r.status,
          count: r._count._all,
        })),
        purchaseOrdersByStatus: purchaseOrdersByStatus.map((r) => ({
          status: r.status,
          count: r._count._all,
        })),
      },
      kpis,
      financial,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar overview do dashboard:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          title: "Erro interno",
          message: "Erro interno no servidor",
        },
      },
      { status: 500 },
    );
  }
}