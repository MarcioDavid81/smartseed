"use client"

import { useEffect, useState } from "react"
import { SummaryCards } from "./SummaryCards"
import { ProductivityByFieldChart } from "./ProductivityByFieldChart"
import { ParticipationChart } from "./ParticipationChart"
import { getToken } from "@/lib/auth-client"
import { useCycle } from "@/contexts/CycleContext"
import { AgroLoader } from "@/components/agro-loader"

interface FieldReport {
  talhaoId: string
  talhaoName: string
  productType: string
  totalKg: number
  totalSc: number
  areaHa: number
  productivityKgHa: number
  productivityScHa: number
  participationPercent: number
}

interface DashboardData {
  summary: {
    totalKg: number
    totalSc: number
    totalAreaHa: number
    avgProductivityKgHa: number
    avgProductivityScHa: number
  } | null
  fieldReports: FieldReport[]
  message?: string
}

export default function DashboardContent() {
  const { selectedCycle } = useCycle()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedCycle?.id) return

    async function loadDashboard() {
      try {
        setLoading(true)
        setError(null)

        const token = getToken()
        if (!token) {
          setError("Usuário não autenticado.")
          setLoading(false)
          return
        }

        const res = await fetch(`/api/reports/cycle-yield/${selectedCycle?.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Erro ao buscar relatório: ${res.statusText}`)
        }

        const json = await res.json()
        setData(json)
      } catch (err: any) {
        console.error("Erro ao carregar dashboard agrícola:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [selectedCycle?.id])

  if (loading) {
    return <AgroLoader />
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-80 text-red font-light">
        {error}
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
