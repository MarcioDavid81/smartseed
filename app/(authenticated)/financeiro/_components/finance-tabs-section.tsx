"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinanceTable } from "./finance-table"

interface FinanceTabsSectionProps {
  payables: any[]
  receivables: any[]
}

export function FinanceTabsSection({ payables, receivables }: FinanceTabsSectionProps) {
  return (
    <section>
      <Tabs defaultValue="payables">
        <TabsList>
          <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
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
