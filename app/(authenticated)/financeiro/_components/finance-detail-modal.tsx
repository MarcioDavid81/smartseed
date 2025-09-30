"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { AccountPayable, AccountReceivable } from "@/types"
import { formatCurrency } from "@/app/_helpers/currency"
import { ACCOUNT_STATUS_LABELS } from "../../_constants/financial"

interface FinanceDetailModalProps {
  account: AccountPayable | AccountReceivable
  children: React.ReactNode
}

export function FinanceDetailModal({ account, children }: FinanceDetailModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Conta</DialogTitle>
          <DialogDescription>
            Informações detalhadas da operação financeira.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Descrição:</span>
            <span>{account.description}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Valor:</span>
            <span>{formatCurrency(account.amount)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Vencimento:</span>
            <span>{format(new Date(account.dueDate), "dd/MM/yyyy")}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span>{ACCOUNT_STATUS_LABELS[account.status]}</span>
          </div>

          {"paymentDate" in account && account.paymentDate && (
            <div className="flex justify-between">
              <span className="font-medium">Data de Pagamento:</span>
              <span>{format(new Date(account.paymentDate), "dd/MM/yyyy")}</span>
            </div>
          )}

          {"receivedDate" in account && account.receivedDate && (
            <div className="flex justify-between">
              <span className="font-medium">Data de Recebimento:</span>
              <span>{format(new Date(account.receivedDate), "dd/MM/yyyy")}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
