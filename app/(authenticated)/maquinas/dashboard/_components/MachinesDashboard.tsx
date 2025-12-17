"use client"

import { useEffect, useState } from "react"
import { useMachines } from "@/queries/machines/use-machine-query"
import { useMachineCosts } from "@/queries/machines/use-machine-costs"
import { MachineSelect } from "./MachineSelect"
import { MachineCostsChart } from "./MachineCostsChart"
import { DashboardCard } from "./DashboardCard"
import { DollarSign, Fuel, Tractor, Wrench } from "lucide-react"
import { AgroLoader } from "@/components/agro-loader"

export function MachinesDashboard() {
  const { data: machines = [] } = useMachines()

  const [selectedMachineId, setSelectedMachineId] = useState<string>("")

  // seleciona a primeira máquina automaticamente
  useEffect(() => {
    if (machines.length && !selectedMachineId) {
      setSelectedMachineId(machines[0].id)
    }
  }, [machines, selectedMachineId])

  const { data, isLoading, isPending } = useMachineCosts(
    selectedMachineId,
  )

  if (isPending || !data) return <AgroLoader />

  return (
    <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <MachineSelect
              machines={machines}
              value={selectedMachineId}
              onChange={setSelectedMachineId}
            />
          </div>
          {/* Cards */}
          <div className="grid grid-cols-4 gap-4">
            <DashboardCard
              title="Total de Combustível Consumido"
              value={data?.totals?.liters?.toFixed(2)}
              icon={<Tractor />}
            />
            <DashboardCard
              title="Custo Total de Combustível"
              value={data?.totals?.fuel?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              icon={<Fuel />}
            />
            <DashboardCard
              title="Total de Manutenção Gasta"
              value={data?.totals?.maintenance?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              icon={<Wrench />}
            />
            <DashboardCard
              title="Total Gasto"
              value={data?.totals?.total?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              icon={<DollarSign />}
            />
          </div>
          {/* Gráfico */}
          <MachineCostsChart data={data.monthly} />
    </div>
  )
}
