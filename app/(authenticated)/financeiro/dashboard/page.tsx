import { Metadata } from "next";
import NavItems from "../../_components/NavItems";
import FinanceContent from "../_components/finance-content";

export const metadata: Metadata = {
  title: "Dashboard Financeiro",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
  ],
};

export default async function FinancialPage() {
  return (
    <div className="flex flex-col w-full md:h-screen bg-found">
      <div className="h-full w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0 h-full flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 flex-shrink-0">
            <h1 className="text-2xl font-medium mb-4">Dashboard Financeiro</h1>
            <NavItems />
          </div>
          <div className="flex-1 overflow-hidden">
            <FinanceContent />
          </div>
        </main>
      </div>
    </div>
  );
}
