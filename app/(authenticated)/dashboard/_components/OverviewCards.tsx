"use client";

import { DashboardOverview } from "../../_features/dashboard/types/dashboard-overview";
import {
  Tractor,
  Wheat,
  Warehouse,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPinned,
  CloudRainWind,
} from "lucide-react";
import { KpiCard } from "./kpi-card";

type Props = {
  data: DashboardOverview;
};

export function OverviewCards({ data }: Props) {
  const plantedArea = data.areas.talhoesTotalHa;
  const totalFarms = data.counts.farms;
  const result = data.kpis.operational.result;
  const receivable = data.kpis.cash.receivableOpen;
  const payable = data.kpis.cash.payableOpen;
  const machines = data.counts.machines;
  const rains = data.operations.rains.quantity;

  const stock = data.stocks.seedStockKgByProduct.reduce(
    (acc, p) => acc + p.stockKg,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">

      <KpiCard
        title="Fazendas Ativas"
        value={String(totalFarms)}
        description="Cadastradas no sistema"
        icon={MapPinned}
      />

      <KpiCard
        title="Área Cultivável"
        value={`${plantedArea.toLocaleString("pt-BR")} ha`}
        description="Total de talhões cultiváveis"
        icon={Wheat}
      />

      <KpiCard
        title="Resultado Operacional"
        value={`R$ ${result.toLocaleString("pt-BR")}`}
        description={
          result > 0 ? "Operação lucrativa" : "Operação no prejuízo"
        }
        icon={result > 0 ? TrendingUp : TrendingDown}
        status={result > 0 ? "good" : "danger"}
      />

      <KpiCard
        title="Contas a Receber"
        value={`R$ ${receivable.toLocaleString("pt-BR")}`}
        description="Valores ainda não recebidos"
        icon={DollarSign}
        status="good"
      />

      <KpiCard
        title="Contas a Pagar"
        value={`R$ ${payable.toLocaleString("pt-BR")}`}
        description="Compromissos financeiros abertos"
        icon={TrendingDown}
        status="danger"
      />

      <KpiCard
        title="Estoque de Sementes"
        value={`${stock.toLocaleString("pt-BR")} kg`}
        description="Disponível para venda ou uso"
        icon={Warehouse}
      />

      <KpiCard
        title="Máquinas"
        value={String(machines)}
        description="Cadastradas no sistema"
        icon={Tractor}
      />

      <KpiCard
        title="Chuvas"
        value={String(rains) + " mm"}
        description="Chuva acumulada"
        icon={CloudRainWind}
      />

    </div>
  );
}
