"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export function ParticipationChart({ fieldReports }: { fieldReports: any[] }) {
  // Ordenar por maior participação
  const sorted = [...fieldReports].sort(
    (a, b) => b.participationPercent - a.participationPercent
  );

  // Cores mais harmônicas e escaláveis
  const COLORS = ["#71D42B", "#63B926", "#49871C", "#346114"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-normal tracking-tight">Participação por Talhão (%)</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Gráfico */}
            <div className="w-full lg:w-1/2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sorted}
                    dataKey="participationPercent"
                    nameKey="talhaoName"
                    outerRadius={110}
                    paddingAngle={2}
                    isAnimationActive={true}
                    labelLine={false}
                    label={false}
                  >
                    {sorted.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda PRO */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 justify-center">
              {sorted.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition"
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />

                  <div className="flex flex-col">
                    <span className="text-sm font-medium tracking-tight">
                      {item.talhaoName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.totalSc.toFixed(2)} sc produzidas
                    </span>
                  </div>

                  <span className="ml-auto font-semibold text-sm">
                    {item.participationPercent.toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

