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
import { Button } from "@/components/ui/button"

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
          <TableHead>Data do Pagamento</TableHead>
          <TableHead>Alterar Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          // Determinar data de pagamento/recebimento
          let paymentDateDisplay = "-"
          if (item.status === "PAID") {
            if ("paymentDate" in item && item.paymentDate) {
              // Compra (AccountPayable)
              paymentDateDisplay = format(new Date(item.paymentDate), "dd/MM/yyyy", { locale: ptBR })
            } else if ("receivedDate" in item && item.receivedDate) {
              // Venda (AccountReceivable)
              paymentDateDisplay = format(new Date(item.receivedDate), "dd/MM/yyyy", { locale: ptBR })
            }
          }

          return (
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
                  className={
                    item.status === "PENDING"
                      ? "bg-yellow-500 text-white rounded-full text-xs font-light hover:bg-opacity-90"
                      : item.status === "PAID"
                      ? "bg-green-500 text-white rounded-full text-xs font-light hover:bg-opacity-90"
                      : item.status === "OVERDUE"
                      ? "bg-red-500 text-white rounded-full text-xs font-light hover:bg-opacity-90"
                      : item.status === "CANCELED"
                      ? "bg-gray-500 text-white rounded-full text-xs font-light hover:bg-opacity-90"
                      : "bg-gray-400 text-white rounded-full text-xs font-light hover:bg-opacity-90"
                  }
                >
                  {item.status === "PENDING" ? "Pendente" 
                   : item.status === "PAID" ? "Pago"
                   : item.status === "OVERDUE" ? "Vencido"
                   : item.status === "CANCELED" ? "Cancelado"
                   : item.status}
                </Badge>
              </TableCell>
              <TableCell>{paymentDateDisplay}</TableCell>
              <TableCell>
                <Button variant="outline">...</Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
