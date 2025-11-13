"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wheat, Ruler, LineChart } from "lucide-react"

interface Summary {
  totalKg: number
  totalSc: number
  totalAreaHa: number
  avgProductivityKgHa: number
  avgProductivityScHa: number
}

export function SummaryCards({ summary }: { summary: Summary }) {
  const cards = [
    {
      title: "Produção Total",
      value: `${summary.totalSc.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} sc`,
      icon: Wheat,
    },
    {
      title: "Área Cultivada",
      value: `${summary.totalAreaHa.toLocaleString("pt-BR")} ha`,
      icon: Ruler,
    },
    {
      title: "Produtividade Média",
      value: `${summary.avgProductivityScHa.toFixed(2)} sc/ha`,
      icon: LineChart,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map(({ title, value, icon: Icon }) => (
        <Card key={title} className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="font-normal">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
