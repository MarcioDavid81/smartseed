export type ProductType = "SOJA" | "MILHO" | "TRIGO" | "AVEIA_BRANCA" | "AVEIA_PRETA" | "AVEIA_UCRANIANA" | "AZEVEM";

export type MachineType = "TRACTOR" | "COMBINE" | "SPRAYER" | "PICKUP" | "TRUCK" | "IMPLEMENT" | "OTHER";

export type ContractStatus = "OPEN" | "PARTIAL_FULFILLED" | "FULFILLED" | "CANCELED";

export type AccountStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELED";

export interface DashboardScope {
  cycleId: string | null;
  cycles: {
    id: string;
    name: string;
  }[];
}

export interface MachinesByType {
  type: MachineType;
  count: number;
}

export interface DashboardCounts {
  farms: number;
  talhoes: number;
  customers: number;
  products: number;
  cultivars: number;
  machines: number;
  machinesByType: MachinesByType[];
  fuelTanks: number;
}

export interface DashboardAreas {
  farmsTotalHa: number;
  talhoesTotalHa: number;
  plantedAreaTotalHa: number;
  plantedAreaByProductHa: Record<string, number>;
}

export interface DashboardProduction {
  seedHarvestKgByProduct: Record<string, number>;
  industryHarvestKgByProduct: Record<string, number>;
  totalHarvestKgByProduct: Record<string, number>;
}

export interface SeedStockByProduct {
  product: ProductType;
  cultivarsCount: number;
  stockKg: number;
}

export interface IndustryStockByProduct {
  product: ProductType;
  stockKg: number;
}

export interface FuelTankOverview {
  id: string;
  name: string;
  capacity: number;
  stock: number;
}

export interface DashboardFuel {
  totalCapacityLiters: number;
  totalStockLiters: number;
  tanks: FuelTankOverview[];
}

export interface DashboardStocks {
  seedStockKgByProduct: SeedStockByProduct[];
  industryStockKgByProduct: IndustryStockByProduct[];
  inputStockByClass: Record<string, number>;
  fuel: DashboardFuel;
}

export interface DashboardOperations {
  applicationsCount: number;
  refuels: {
    count: number;
    quantityLiters: number;
  };
  rains: {
    count: number;
    quantity: number;
  };
}

export interface StatusCount {
  status: ContractStatus;
  count: number;
}

export interface DashboardCommercial {
  saleContractsByStatus: StatusCount[];
  purchaseOrdersByStatus: StatusCount[];
}

export interface TalhaoProductivity {
  talhaoId: string;
  talhaoName: string;
  farmId: string;
  farmName: string;
  areaHa: number;
  productionKg: number;
  yieldKgPerHa: number;
}

export interface FarmProductivity {
  farmId: string;
  farmName: string;
  areaHa: number;
  productionKg: number;
  yieldKgPerHa: number;
}

export interface OperationalKPI {
  revenueTotal: number;
  expensesTotal: number;
  result: number;
  marginPercent: number;
}

export interface CashKPI {
  received: number;
  paid: number;
  net: number;
  payableOpen: number;
  receivableOpen: number;
}

export interface FuelTankAlert {
  id: string;
  name: string;
  capacity: number;
  stock: number;
  fillPercent: number;
}

export interface AccountsAlert {
  dueSoonDays: number;
  payablesDueSoon: unknown[];
  receivablesDueSoon: unknown[];
  payablesOverdueCount: number;
  receivablesOverdueCount: number;
}

export interface DashboardAlerts {
  seedLowStockThresholdKg: number;
  lowSeedCultivars: unknown[];
  inputsOutOfStock: unknown[];
  inputsLowStock: unknown[];
  fuelTanksLow: FuelTankAlert[];
  accounts: AccountsAlert;
}

export interface MachineFuelUsage {
  type: MachineType;
  fuelLiters: number;
  estimatedFuelCost: number;
}

export interface MachineOperationalCost {
  machineId: string;
  name: string;
  type: MachineType;
  fuelLiters: number;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
}

export interface DashboardKPIs {
  productivity: {
    byTalhaoTop: TalhaoProductivity[];
    byTalhaoBottom: TalhaoProductivity[];
    byFarmTop: FarmProductivity[];
  };
  beneficiation: {
    count: number;
    quantityKg: number;
    rateVsSeedHarvestPercent: number;
  };
  operational: OperationalKPI;
  cash: CashKPI;
  alerts: DashboardAlerts;
  machines: {
    averageFuelPricePerLiter: number;
    topMachineTypesByFuel: MachineFuelUsage[];
    topMachinesByOperationalCost: MachineOperationalCost[];
  };
}

export interface DashboardFinancial {
  expenses: {
    inputsPurchases: {
      count: number;
      quantity: number;
      total: number;
    };
    seedPurchases: {
      count: number;
      quantityKg: number;
      total: number;
    };
    fuelPurchases: {
      count: number;
      quantityLiters: number;
      total: number;
    };
    maintenances: {
      count: number;
      total: number;
    };
  };
  revenue: {
    seedSales: {
      count: number;
      quantityKg: number;
      total: number;
    };
    industrySales: {
      count: number;
      total: number;
    };
  };
  accountsPayableByStatus: {
    status: AccountStatus;
    count: number;
    total: number;
  }[];
  accountsReceivableByStatus: {
    status: AccountStatus;
    count: number;
    total: number;
  }[];
}

export interface DashboardOverview {
  scope: DashboardScope;
  counts: DashboardCounts;
  areas: DashboardAreas;
  production: DashboardProduction;
  stocks: DashboardStocks;
  operations: DashboardOperations;
  commercial: DashboardCommercial;
  kpis: DashboardKPIs;
  financial: DashboardFinancial;
}
