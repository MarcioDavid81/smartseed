import { FinanceCard } from "./finance-card"

export function FinanceCardsSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FinanceCard title="Contas a Pagar" value="R$ 15.000" trend="-5%" />
      <FinanceCard title="Contas a Receber" value="R$ 22.500" trend="+12%" />
      <FinanceCard title="Saldo Líquido" value="R$ 7.500" trend="+8%" />
      <FinanceCard title="Pagos no Mês" value="R$ 4.200" trend="+3%" />
    </section>
  )
}
