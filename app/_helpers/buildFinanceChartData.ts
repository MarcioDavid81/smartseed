import { AccountPayable, AccountReceivable } from "@/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function buildFinanceChartData(
  payables: AccountPayable[],
  receivables: AccountReceivable[]
) {
  const monthsMap: Record<string, { payables: number; receivables: number }> = {}

  payables.forEach((p) => {
    if (!p.dueDate) return
    const month = format(new Date(p.dueDate), "MMM", { locale: ptBR })
    monthsMap[month] = monthsMap[month] || { payables: 0, receivables: 0 }
    monthsMap[month].payables += p.amount
  })

  receivables.forEach((r) => {
    if (!r.dueDate) return
    const month = format(new Date(r.dueDate), "MMM", { locale: ptBR })
    monthsMap[month] = monthsMap[month] || { payables: 0, receivables: 0 }
    monthsMap[month].receivables += r.amount
  })

  return Object.entries(monthsMap).map(([month, values]) => ({
    month,
    ...values,
  }))
}
