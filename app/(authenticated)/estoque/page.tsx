import Saudacao from "../_components/Saudacao";
import { Metadata } from "next";
import HarvestButton from "./_components/HarvestButton";
import BuyButton from "./_components/BuyButton";
import BeneficiationButton from "./_components/BeneficiationButton";
import NewSaleButton from "./_components/SaleExitButton";
import ConsumptionButton from "./_components/ConsumptionButtton";
import { ListStockTable } from "./_components/ListStockTable";

export const metadata: Metadata = {
  title: "Estoque",
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

export default async function StockPage() {

    return (
      <div className="flex flex-col w-full min-h-screen bg-found">
        <div className="min-h-screen w-full flex bg-background">
          <main className="flex-1 py-4 px-4 md:px-8 text-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-semibold mb-4">Estoque</h1>
              <Saudacao />
            </div>
            <div className="flex flex-col items-start mb-4 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 mr-4">Operações</h2>
              <div className="flex items-center space-x-10 justify-between">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <h4>Entradas</h4>
                    <div className="flex space-x-6">
                      <HarvestButton />
                      <BuyButton />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <h4>Saídas</h4>
                    <div className="flex space-x-6">
                      <BeneficiationButton />
                      <NewSaleButton />
                      <ConsumptionButton />
                    </div>
                  </div>
              </div>
            </div>
            <ListStockTable />
          </main>
        </div>
      </div>
    );
}
