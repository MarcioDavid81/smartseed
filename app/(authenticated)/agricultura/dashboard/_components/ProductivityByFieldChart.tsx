"use client";

import { formatNumber } from "@/app/_helpers/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200 text-xs tracking-tight space-y-1">
      <div className="font-semibold text-gray-800">{item.talhaoName}</div>

      <div className="text-gray-700">
        <strong>Total colhido:</strong> {formatNumber(item.totalSc)} sc
      </div>
      <div className="text-gray-700">
        <strong>Área:</strong> {formatNumber(item.areaHa)} ha
      </div>
      <div className="text-gray-700">
        <strong>Produtividade:</strong>{" "}
        {formatNumber(item.productivityScHa)} sc/ha
      </div>
    </div>
  );
}

export function ProductivityByFieldChart({
  fieldReports,
}: {
  fieldReports: FieldReport[];
}) {

const sortedReports = [...fieldReports].sort((a, b) =>
  a.talhaoName.localeCompare(b.talhaoName)
);

  return (
    <Card className="rounded-2xl shadow-sm border bg-gradient-to-br from-white to-neutral-50">
      <CardHeader>
        <CardTitle className="font-normal tracking-tight">
          Indicador de Produtividade por área (sc/ha)
        </CardTitle>
      </CardHeader>

      <CardContent>
          
          {/* Wrapper com largura dinâmica */}
          <div className="w-full">
            
            <ResponsiveContainer width="100%" height={330}>
              <ComposedChart data={sortedReports} className="font-light text-xs">
                
                <XAxis
                  dataKey="talhaoName"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                {/* Primeira escala → Área */}
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                {/* Segunda escala → Produtividade */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Barras (área do talhão) */}
                <Bar
                  dataKey="areaHa"
                  yAxisId="left"
                  name="Área (ha)"
                  fill="url(#areaGradient)"
                  maxBarSize={40}
                  radius={[8, 8, 0, 0]}
                />

                {/* Linha (produtividade média) */}
                <Line
                  type="monotone"
                  dataKey="productivityScHa"
                  yAxisId="right"
                  stroke="url(#lineGradient)"
                  strokeWidth={1}
                  dot={{ r: 4, strokeWidth: 1, stroke: "#1A3F0E" }}
                  activeDot={{ r: 6 }}
                />

                <defs>
                  {/* Gradiente barras */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#79D82F" />
                    <stop offset="100%" stopColor="#4C8A1F" />
                  </linearGradient>

                  {/* Gradiente linha */}
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#285AE8" />
                    <stop offset="100%" stopColor="#0033A0" />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
      </CardContent>
    </Card>
  );
}
