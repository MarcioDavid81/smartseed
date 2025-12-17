"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion";

type Props = {
  data: {
    month: string
    fuel: number
    maintenance: number
  }[]
}

export function MachineCostsChart({ data }: Props) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-normal tracking-tight">
          Custos mensais da máquina
        </CardTitle>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} className="font-light text-xs">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
            />
            <Bar dataKey="fuel" name="Combustível" fill="#71D42B" radius={[10, 10, 0, 0]} />
            <Bar dataKey="maintenance" name="Manutenção" fill="#63B926" radius={[10, 10, 0, 0]} />
            {/* Gradiente Premium */}
            <defs>
              <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#79D82F" />
                <stop offset="100%" stopColor="#4C8A1F" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    </motion.div>
  )
}
