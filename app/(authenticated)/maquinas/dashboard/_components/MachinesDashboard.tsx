"use client";


import { useMachinesDashboard } from "@/queries/machines/use-machines-dashboard";
import { Fuel, Tractor, Wrench, DollarSign } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { AgroLoader } from "@/components/agro-loader";

export function MachinesDashboard() {
  const { data, isLoading } = useMachinesDashboard();

  if (isLoading) {
    return <AgroLoader />
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Máquinas"
        value={data.totalMachines.toString()}
        icon={<Tractor size={22} />}
      />

      <DashboardCard
        title="Combustível em estoque"
        value={`${data.totalFuelStock.toLocaleString("pt-BR")} L`}
        icon={<Fuel size={22} />}
      />

      <DashboardCard
        title="Gasto com combustível"
        value={data.totalFuelCost.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        icon={<DollarSign size={22} />}
      />

      <DashboardCard
        title="Gasto com manutenções"
        value={data.totalMaintenanceCost.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        icon={<Wrench size={22} />}
      />
    </div>
  );
}
