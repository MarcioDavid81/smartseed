"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface ChartData {
  month: string
  payables: number
  receivables: number
}

export function FinanceChartSection({ data }: { data: ChartData[] }) {
  return (
    <section className="bg-card p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4">Evolução Financeira</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="payables" stackId="1" stroke="#ef4444" fill="#fca5a5" name="A Pagar" />
          <Area type="monotone" dataKey="receivables" stackId="1" stroke="#22c55e" fill="#86efac" name="A Receber" />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
