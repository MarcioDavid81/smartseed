"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/app/_helpers/currency"
import { AccountPayable, AccountReceivable } from "@/types"
import { ACCOUNT_STATUS_LABELS } from "../../_constants/financial"

interface FinanceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: AccountPayable | AccountReceivable | null
}

export function FinanceDetailModal({ open, onOpenChange, account }: FinanceDetailModalProps) {
  if (!account) return null

  const isPayable = "paymentDate" in account
  const paymentOrReceivedDate =
    account.status === "PAID"
      ? isPayable
        ? account.paymentDate
        : (account as AccountReceivable).receivedDate
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Conta</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Descrição</p>
            <p className="font-medium">{account.description}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Valor</p>
            <p className="font-medium">{formatCurrency(account.amount)}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Vencimento</p>
            <p className="font-medium">
              {account.dueDate
                ? format(new Date(account.dueDate), "dd/MM/yyyy", { locale: ptBR })
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge
              className={
                account.status === "PENDING"
                  ? "bg-yellow-500 text-white rounded-full text-xs font-light"
                  : "bg-green text-white rounded-full text-xs font-light"
              }
            >
              {ACCOUNT_STATUS_LABELS[account.status]}
            </Badge>
          </div>

          {paymentOrReceivedDate && (
            <div className="col-span-2">
              <p className="text-muted-foreground">
                {isPayable ? "Data do Pagamento" : "Data do Recebimento"}
              </p>
              <p className="font-medium">
                {format(new Date(paymentOrReceivedDate), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
