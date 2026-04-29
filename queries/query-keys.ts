import type { ProductType } from "@prisma/client";

export const queryKeys = {
  adress: {
    ibgeStates: ["ibge-states"] as const,
    ibgeCities: (currentState: string) => ["ibge-cities", currentState] as const,
  },

  commercial: {
    purchaseOrders: {
      all: ["purchase-orders"] as const,
      byId: (purchaseOrderId: string) => ["purchase-orders", purchaseOrderId] as const,
    },
    saleContracts: {
      all: ["sale-contracts"] as const,
      byId: (saleContractId: string) => ["sale-contracts", saleContractId] as const,
    },
  },

  financial: {
    accountPayables: ["account-payables"] as const,
    accountReceivables: ["account-receivables"] as const,
  },

  industry: {
    adjust: ["industry-adjust"] as const,
    dashboardData: (selectedCycleId?: string) =>
      ["industryDashboardData", selectedCycleId] as const,
    deposit: {
      all: ["industry-deposit"] as const,
      byId: (depositId: string) => ["industry-deposit", depositId] as const,
    },
    harvest: (harvestId: string) => ["industryHarvest", harvestId] as const,
    harvests: (cycleId: string) => ["industryHarvests", cycleId] as const,
    sale: {
      all: ["industrySale"] as const,
      byId: (saleId: string) => ["industrySale", saleId] as const,
    },
    sales: ["industrySales"] as const,
    stock: {
      all: ["industry-stock"] as const,
      list: <TFilters extends Record<string, unknown> | undefined>(
        filters?: TFilters,
      ) => ["industry-stock", filters] as const,
      statement: (product: ProductType, depositId: string) =>
        ["industry-stock", product, depositId] as const,
    },
    transfer: ["industry-transfer"] as const,
    transporter: ["industry-transporter"] as const,
  },

  input: {
    applications: (cycleId: string) => ["input-applications", cycleId] as const,
    product: ["input-product"] as const,
    purchase: {
      all: ["input-purchase"] as const,
      byId: (purchaseId: string) => ["input-purchase", purchaseId] as const,
    },
    stock: {
      all: ["input-stock"] as const,
      list: <TFilters extends Record<string, unknown> | undefined>(
        filters?: TFilters,
      ) => ["input-stock", filters] as const,
      byProductAndFarm: (productId?: string, farmId?: string) =>
        ["input-stock", productId, farmId] as const,
    },
    transfer: ["input-transfer"] as const,
  },

  machines: {
    all: ["machines"] as const,
    costs: (machineId: string) => ["machine-costs", machineId] as const,
    dashboard: ["machines-dashboard"] as const,
    fuelPurchases: {
      all: ["fuelPurchases"] as const,
      byId: (fuelPurchaseId: string) => ["fuelPurchases", fuelPurchaseId] as const,
    },
    fuelTanks: ["fuelTanks"] as const,
    maintenances: {
      all: ["maintenances"] as const,
      byId: (maintenanceId: string) => ["maintenances", maintenanceId] as const,
    },
    refuels: ["refuels"] as const,
  },

  registrations: {
    cultivars: (productType?: ProductType) => ["cultivars", productType] as const,
    cultivarsWithStock: (productType?: ProductType) =>
      ["cultivars-with-stock", productType] as const,
    customers: ["customers"] as const,
    cycle: (cycleId: string) => ["cycle", cycleId] as const,
    cycles: ["cycles"] as const,
    farms: ["farms"] as const,
    members: {
      all: ["members"] as const,
      byId: (memberId: string) => ["members", memberId] as const,
    },
    plots: ["plots"] as const,
    users: ["users"] as const,
  },

  seed: {
    adjust: {
      all: ["seed-adjust"] as const,
      byCycle: (cycleId: string) => ["seed-adjust", cycleId] as const,
    },
    beneficiation: {
      all: ["seed-beneficiation"] as const,
      byCycle: (cycleId: string) => ["seed-beneficiation", cycleId] as const,
    },
    buy: {
      all: ["seed-buy"] as const,
      byId: (buyId: string) => ["seed-buy", buyId] as const,
      byCycle: (cycleId: string) => ["seed-buy", cycleId] as const,
    },
    consumption: {
      all: ["seed-consumption"] as const,
      byCycle: (cycleId: string) => ["seed-consumption", cycleId] as const,
    },
    cultivar: {
      all: ["seed-cultivar"] as const,
      availableForSale: ["seed-cultivar-available-for-sale"] as const,
      byId: (cultivarId: string) => ["seed-cultivar", cultivarId] as const,
    },
    cultivarStock: {
      all: ["seed-cultivar-stock"] as const,
      list: <TFilters extends Record<string, unknown> | undefined>(
        filters?: TFilters,
      ) => ["seed-cultivar-stock", filters] as const,
    },
    harvest: {
      all: ["seed-harvest"] as const,
      byCycle: (cycleId: string) => ["seed-harvest", cycleId] as const,
    },
    sale: {
      all: ["seed-sale"] as const,
      byId: (saleId: string) => ["seed-sale", saleId] as const,
      byCycle: (cycleId: string) => ["seed-sale", cycleId] as const,
    },
    stock: (cultivarId: string) => ["seed-stock", cultivarId] as const,
    transformation: ["transformation"] as const,
  },

  weather: {
    rains: ["rains"] as const,
    weather: (normalizedCity: string) => ["weather", normalizedCity] as const,
  },
} as const;