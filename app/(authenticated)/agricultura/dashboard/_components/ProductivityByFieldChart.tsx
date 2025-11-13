"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ProductivityByFieldChart({ fieldReports }: { fieldReports: any[] }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Produtividade por Talhão (sc/ha)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fieldReports} className="font-light text-xs">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="talhaoName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="productivityScHa" fill="#63B926" radius={[8, 8, 0, 0]} name="Produtividade" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
