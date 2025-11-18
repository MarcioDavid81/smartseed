"use client"

import { formatNumber } from "@/app/_helpers/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts"

type FieldReport = {
  talhaoName: string;
  productivityScHa: number;
  areaHa: number;
  totalKg: number;
  totalSc: number;
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload as FieldReport;

  return (
    <div
      className="bg-white p-3 rounded-xl shadow-md border border-gray-200 text-xs tracking-tight space-y-1"
    >
      <div className="font-semibold text-gray-800">{item.talhaoName}</div>

      <div className="text-gray-700">
        <strong>Total colhido:</strong> {formatNumber(item.totalSc)} sc
      </div>
      <div className="text-gray-700">
        <strong>Área:</strong> {formatNumber(item.areaHa)} ha
      </div>
      <div className="text-gray-700">
        <strong>Produtividade:</strong> {formatNumber(item.productivityScHa)} sc/ha
      </div>

    </div>
  );
}

export function ProductivityByFieldChart({ fieldReports }: { fieldReports: FieldReport[] }) {
  return (
    <Card className="rounded-2xl shadow-sm border bg-gradient-to-br from-white to-neutral-50">
      <CardHeader>
        <CardTitle className="font-normal tracking-tight">
          Produtividade por Talhão (sc/ha)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={fieldReports} className="font-light text-xs">

            <XAxis
              dataKey="talhaoName"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={<CustomTooltip />}
            />

            <Bar
              dataKey="productivityScHa"
              name="Produtividade"
              radius={[10, 10, 0, 0]}
              fill="url(#premiumGradient)"
            />

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
  )
}
