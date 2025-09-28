"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AccountPayable, AccountReceivable } from "@/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/app/_helpers/currency"

interface FinanceTableProps {
  data: (AccountPayable | AccountReceivable)[]
}

export function FinanceTable({ data }: FinanceTableProps) {
  if (!data.length) {
    return (
      <div className="rounded-lg border p-4 text-center text-muted-foreground">
        Nenhum registro encontrado
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.description}</TableCell>
            <TableCell>{formatCurrency(item.amount)}</TableCell>
            <TableCell>
              {item.dueDate
                ? format(new Date(item.dueDate), "dd/MM/yyyy", { locale: ptBR })
                : "-"}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  item.status === "PAID" || item.status === "PENDING"
                    ? "destructive"
                    : "secondary"
                }
              >
                {item.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
