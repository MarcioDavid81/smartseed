"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ChartData {
  month: string;
  payables: number;
  receivables: number;
}

export function FinanceChartSection({ data }: { data: ChartData[] }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold">Evolução Financeira</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="payables"
            stackId="1"
            stroke="#ef4444"
            fill="#fca5a5"
            name="A Pagar"
          />
          <Area
            type="monotone"
            dataKey="receivables"
            stackId="1"
            stroke="#22c55e"
            fill="#86efac"
            name="A Receber"
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
