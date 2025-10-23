"use client"

import { useEffect, useState } from "react"
import { FinanceCard } from "./finance-card"
import { FinanceChartSection } from "./finance-chart-section"
import { AccountPayable, AccountReceivable } from "@/types"
import { getToken } from "@/lib/auth-client"
import { formatCurrency } from "@/app/_helpers/currency"
import { buildFinanceChartData } from "@/app/_helpers/buildFinanceChartData"
import { FinanceTabsSection } from "./finance-tabs-section"

export function FinanceCardsSection() {
  const [payables, setPayables] = useState<AccountPayable[]>([])
  const [receivables, setReceivables] = useState<AccountReceivable[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()
      const [payablesRes, receivablesRes] = await Promise.all([
        fetch("/api/financial/payables", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/financial/receivables", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const [payablesData, receivablesData] = await Promise.all([
        payablesRes.json(),
        receivablesRes.json(),
      ])
      setPayables(payablesData)
      setReceivables(receivablesData)

      // monta dataset do gráfico
      const chart = buildFinanceChartData(payablesData, receivablesData)
      setChartData(chart)
    }
    fetchData()
  }, [])

  const totalPayables = payables.reduce((acc, curr) => acc + curr.amount, 0)
  const totalReceivables = receivables.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Cards - sempre visíveis no topo */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        <FinanceCard
          title="Contas a Pagar"
          value={formatCurrency(totalPayables)}
          trend={`${totalPayables > 0 ? "+" : "-"}${formatCurrency(totalPayables)}`}
        />
        <FinanceCard
          title="Contas a Receber"
          value={formatCurrency(totalReceivables)}
          trend={`${totalReceivables > 0 ? "+" : "-"}${formatCurrency(totalReceivables)}`}
        />
        <FinanceCard
          title="Saldo Líquido"
          value={formatCurrency(totalReceivables - totalPayables)}
          trend={`${totalReceivables - totalPayables > 0 ? "+" : ""}${formatCurrency(
            totalReceivables - totalPayables
          )}`}
        />
        <FinanceCard
          title="Pagos no Mês"
          value={formatCurrency(
            payables
              .filter((p) => p.paymentDate) // já pagos
              .reduce((acc, curr) => acc + curr.amount, 0)
          )}
          trend=""
        />
      </section>

      {/* Área com scroll interno - gráfico e tabelas */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-1">
        {/* Gráfico */}
        <FinanceChartSection data={chartData} />
        <FinanceTabsSection payables={payables} receivables={receivables} />
      </div>
    </div>
  )
}
