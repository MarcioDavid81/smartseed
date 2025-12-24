"use client"

import { SummaryCards } from "./SummaryCards"
import { ProductivityByFieldChart } from "./ProductivityByFieldChart"
import { useCycle } from "@/contexts/CycleContext"
import { AgroLoader } from "@/components/agro-loader"
import { useIndustryDashboardData } from "@/queries/industry/use-dashboard-data-query"


export default function DashboardContent() {
  const { selectedCycle } = useCycle()
  const { 
    data, 
    isLoading, 
    error, 
    isError 
  } = useIndustryDashboardData(selectedCycle?.id)

  if (isLoading) {
    return <AgroLoader />
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-80 text-red font-light">
        {error.message}
      </div>
    )
  }

  // 🧠 Segurança extra: se não tiver dados OU summary nulo, mostra aviso amigável
  if (!data || !data.summary) {
    return (
      <div className="flex flex-col justify-center items-center h-80 text-muted-foreground font-light space-y-2">
        <p>Nenhum dado disponível para o ciclo selecionado.</p>
        <p className="text-sm text-muted-foreground/70">
          Realize colheitas ou cadastre movimentações para visualizar o dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <SummaryCards summary={data.summary} />
      {data.fieldReports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <ProductivityByFieldChart fieldReports={data.fieldReports} />
        </div>
      ) : (
        <div className="text-center text-muted-foreground font-light h-40 flex items-center justify-center">
          Nenhum dado de campo disponível.
        </div>
      )}
    </div>
  )
}
