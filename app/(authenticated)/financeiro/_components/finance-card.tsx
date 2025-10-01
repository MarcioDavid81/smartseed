import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinanceCardProps {
  title: string
  value: string
  trend: string
}

export function FinanceCard({ title, value, trend }: FinanceCardProps) {
  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardTitle className="font-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-medium">{value}</p>
        <p className={`text-xs ${trend.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{trend}</p>
      </CardContent>
    </Card>
  )
}
