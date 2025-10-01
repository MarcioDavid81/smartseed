"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinanceTable } from "./finance-table"
import { AccountPayable, AccountReceivable } from "@/types"

interface FinanceTabsSectionProps {
  payables: AccountPayable[]
  receivables: AccountReceivable[]
}

export function FinanceTabsSection({
  payables,
  receivables,
}: FinanceTabsSectionProps) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow">
      <h2 className="mb-4 text-lg font-normal">
        Últimos Registros{" "}
        <span className="font-light text-xs">
          (5 registros)
        </span>
      </h2>
      <Tabs defaultValue="payables" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="payables" className="font-normal">A Pagar</TabsTrigger>
          <TabsTrigger value="receivables" className="font-normal">A Receber</TabsTrigger>
        </TabsList>
        <TabsContent value="payables">
          <FinanceTable data={payables} />
        </TabsContent>
        <TabsContent value="receivables">
          <FinanceTable data={receivables} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
