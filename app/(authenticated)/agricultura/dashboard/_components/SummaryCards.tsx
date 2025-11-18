"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wheat, Ruler, LineChart } from "lucide-react"
import { motion } from "framer-motion"

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
      sub: `${summary.totalKg.toLocaleString("pt-BR")} kg`,
    },
    {
      title: "Área Cultivada",
      value: `${summary.totalAreaHa.toLocaleString("pt-BR")} ha`,
      icon: Ruler,
      sub: "Área com colheita iniciada",
    },
    {
      title: "Produtividade Média",
      value: `${summary.avgProductivityScHa.toFixed(2)} sc/ha`,
      icon: LineChart,
      sub: `${summary.avgProductivityKgHa.toFixed(2)} kg/ha`,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map(({ title, value, icon: Icon, sub }, index) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.35 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-normal tracking-tight">
                {title}
              </CardTitle>
              <div className="p-2 rounded-xl bg-muted/40">
                <Icon className="h-5 w-5 text-primary text-[#63B926]" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-medium tracking-tight">
                {value}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {sub}
              </div>

              {/* Indicador sutil de progresso */}
              <div className="mt-4 h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${30 + index * 20}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
