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
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search } from "lucide-react"
import { AccountPayable, AccountReceivable } from "@/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/app/_helpers/currency"
import { ACCOUNT_STATUS_LABELS } from "../../_constants/financial"
import { FinanceDetailModal } from "./finance-detail-modal"
import { useState } from "react"

interface FinanceTableProps {
  data: (AccountPayable | AccountReceivable)[]
}

export function FinanceTable({ data }: FinanceTableProps) {
  const [open, setOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<
    AccountPayable | AccountReceivable | null
  >(null)

  const handleOpenDetails = (account: AccountPayable | AccountReceivable) => {
    setSelectedAccount(account)
    setOpen(true)
  }

  return (
    <>
      {!data.length ? (
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          Nenhum registro encontrado
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-light">
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-2 py-0">{item.description}</TableCell>
                <TableCell className="px-2 py-0">{formatCurrency(item.amount)}</TableCell>
                <TableCell className="px-2 py-0">
                  {item.dueDate
                    ? format(new Date(item.dueDate), "dd/MM/yyyy", { locale: ptBR })
                    : "-"}
                </TableCell>
                <TableCell className="px-2 py-0">
                  <Badge
                    className={
                      item.status === "PENDING"
                        ? "bg-yellow-500 text-white rounded-full text-xs font-light hover:bg-opacity-90"
                        : "bg-green text-white rounded-full text-xs font-light hover:bg-opacity-90"
                    }
                  >
                    {ACCOUNT_STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-center px-2 py-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenDetails(item)}
                        >
                          <Search className="text-green" size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Detalhes da Conta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <FinanceDetailModal
        open={open}
        onOpenChange={setOpen}
        account={selectedAccount}
      />
    </>
  )
}
