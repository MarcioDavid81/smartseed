import { FinanceCardsSection } from "./finance-cards-section";
import { FinanceChartSection } from "./finance-chart-section";
import { FinanceTabsSection } from "./finance-tabs-section";

export default function FinanceContent() {
  // Aqui futuramente você busca os dados reais (via server actions ou api)
  const mockPayables = [
    {
      id: "1",
      description: "Compra de sementes - NF 123",
      amount: 5000,
      dueDate: "2025-10-10",
      status: "PENDENTE",
    },
  ];
  const mockReceivables = [
    {
      id: "2",
      description: "Venda de insumos - NF 456",
      amount: 7200,
      dueDate: "2025-10-15",
      status: "RECEBIDO",
    },
  ];
  const mockChartData = [
    { month: "Jan", payables: 5000, receivables: 3000 },
    { month: "Feb", payables: 2000, receivables: 7000 },
    { month: "Mar", payables: 8000, receivables: 9000 },
  ];

  return (
    <main className="space-y-6 p-6">
      <FinanceCardsSection />
      <FinanceChartSection data={mockChartData} />
      <FinanceTabsSection
        payables={mockPayables}
        receivables={mockReceivables}
      />
    </main>
  );
}
