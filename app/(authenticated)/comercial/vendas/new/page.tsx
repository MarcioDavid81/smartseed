import NavItems from "@/app/(authenticated)/_components/NavItems";
import { Metadata } from "next";
import SaleContractForm from "./_components/SaleContractForm";

export const metadata: Metadata = {
  title: "Comercial - Novo Contrato de Venda",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [{ name: "Marcio David", url: "https://www.marciodavid.dev.br" }],
};

export default async function NewSaleContractPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 px-4 md:px-8 text-gray-800 min-w-0">
          <div className="sticky top-0 z-40 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-background flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-medium mb-4 md:mb-0">
              Comercial - Novo Contrato de Venda
            </h1>
            <NavItems />
          </div>

          <div className="pb-4">
            <SaleContractForm />
          </div>
        </main>
      </div>
    </div>
  );
}