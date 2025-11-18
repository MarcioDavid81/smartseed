"use client";

import { formatNumber } from "@/app/_helpers/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type FarmReport = {
  farmName: string;
  productivityScHa: number;
  totalAreaHa: number;
  totalSc: number;
  totalKg: number;
};

function FarmTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload as FarmReport;

  return (
    <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200 text-xs tracking-tight space-y-1">
      <div className="font-semibold text-gray-800">{item.farmName}</div>

      <div className="text-gray-700">
        <strong>Total colhido:</strong> {formatNumber(item.totalSc)} sc
      </div>

      <div className="text-gray-700">
        <strong>Área total:</strong> {formatNumber(item.totalAreaHa)} ha
      </div>

      <div className="text-gray-700">
        <strong>Produtividade média:</strong>{" "}
        {formatNumber(item.productivityScHa)} sc/ha
      </div>
    </div>
  );
}

export function ProductivityByFarmChart({ farmReports }: { farmReports: FarmReport[] }) {
  return (
    <Card className="rounded-2xl shadow-sm border bg-gradient-to-br from-white to-neutral-50">
      <CardHeader>
        <CardTitle className="font-normal tracking-tight">
          Produtividade por Fazenda (sc/ha)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={farmReports} className="font-light text-xs">

            <XAxis
              dataKey="farmName"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<FarmTooltip />} />

            <Bar
              dataKey="productivityScHa"
              name="Produtividade"
              radius={[10, 10, 0, 0]}
              fill="url(#premiumGradientFarm)"
            />

            <defs>
              <linearGradient
                id="premiumGradientFarm"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#3EB75E" />
                <stop offset="100%" stopColor="#1F6B34" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
