"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/app/_helpers/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";
import { MoveLeft } from "lucide-react";

type FarmReport = {
  farmId: string;
  farmName: string;
  productivityScHa: number;
  totalAreaHa: number;
  totalSc: number;
  totalKg: number;
};

type FieldReport = {
  talhaoId: string;
  talhaoName: string;
  farmId: string;
  farmName: string;
  productivityScHa: number;
  totalAreaHa: number;
  totalSc: number;
  totalKg: number;
};

type Props = {
  farmReports: FarmReport[];
  fieldReports: FieldReport[];
};

type ViewLevel = "farm" | "field";

function FarmTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload as FarmReport;

  return (
    <div className="bg-white p-3 rounded-xl shadow-md border text-xs space-y-1">
      <div className="font-semibold">{item.farmName}</div>
      <div>Total: {formatNumber(item.totalSc)} sc</div>
      <div>Área: {formatNumber(item.totalAreaHa)} ha</div>
      <div>Prod: {formatNumber(item.productivityScHa)} sc/ha</div>
    </div>
  );
}

function FieldTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload as FieldReport;

  return (
    <div className="bg-white p-3 rounded-xl shadow-md border text-xs space-y-1">
      <div className="font-semibold">{item.talhaoName}</div>
      <div>Total: {formatNumber(item.totalSc)} sc</div>
      <div>Área: {formatNumber(item.totalAreaHa)} ha</div>
      <div>Prod: {formatNumber(item.productivityScHa)} sc/ha</div>
    </div>
  );
}

export function ProductivityDrilldownChart({
  farmReports,
  fieldReports,
}: Props) {
  const [level, setLevel] = useState<ViewLevel>("farm");
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  // 🔍 Talhões filtrados
  const filteredFields = useMemo(() => {
    if (!selectedFarmId) return [];
    return fieldReports.filter((f) => f.farmId === selectedFarmId);
  }, [selectedFarmId, fieldReports]);

  const data = level === "farm" ? farmReports : filteredFields;

  return (
    <Card className="rounded-2xl shadow-sm border bg-gradient-to-br from-white to-neutral-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-normal tracking-tight">
            {level === "farm"
              ? "Produtividade por Fazenda (sc/ha)"
              : `Fazenda - ${
                  farmReports.find((f) => f.farmId === selectedFarmId)
                    ?.farmName.toLowerCase().substring(0, 1).toUpperCase().concat(farmReports.find((f) => f.farmId === selectedFarmId)?.farmName.toLowerCase().substring(1) || "")
                    || ""
                }`}
          </CardTitle>

          {level === "field" && (
            <button
              onClick={() => {
                setLevel("farm");
                setSelectedFarmId(null);
              }}
              className="text-sm text-green flex items-center gap-1 hover:gap-2 transition-all duration-300"
            >
              <MoveLeft size={16} />
              Voltar
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={330}>
          <ComposedChart
            data={data}
            key={level} // 🔥 força re-render suave
            className="font-light text-xs"
          >
            <XAxis
              dataKey={level === "farm" ? "farmName" : "talhaoName"}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={level === "farm" ? <FarmTooltip /> : <FieldTooltip />}
            />

            <Bar
              yAxisId="left"
              dataKey="totalAreaHa"
              radius={[10, 10, 0, 0]}
              fill="url(#areaGradient)"
              style={{
                cursor: level === "farm" ? "pointer" : "default",
              }}
              onClick={(data: any) => {
                if (level === "farm") {
                  setSelectedFarmId(data.farmId);
                  setLevel("field");
                }
              }}
            />

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
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#79D82F" />
                <stop offset="100%" stopColor="#4C8A1F" />
              </linearGradient>

              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#285AE8" />
                <stop offset="100%" stopColor="#0033A0" />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}