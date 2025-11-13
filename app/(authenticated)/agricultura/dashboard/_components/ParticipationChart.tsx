"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export function ParticipationChart({ fieldReports }: { fieldReports: any[] }) {
  const COLORS = ["#71D42B", "#63B926", "#49871C", "#346114"]

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Participação por Talhão (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={fieldReports}
              dataKey="participationPercent"
              nameKey="talhaoName"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {fieldReports.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
