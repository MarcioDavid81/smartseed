import NavItems from "@/app/(authenticated)/_components/NavItems";
import { Metadata } from "next";
import { SaleContractOverview } from "./_components/SaleOrderOverview";
import { getSaleContractByIdServerSide } from "@/services/commercial/saleContract";

export const metadata: Metadata = {
  title: "Comercial - Vendas",
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

export default async function SaleContractDetailsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const saleContract = await getSaleContractByIdServerSide(id);

  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">
              Comercial - Vendas - Detalhes
            </h1>
            <NavItems />
          </div>

          <div className="grid gap-6">
            <SaleContractOverview saleContract={saleContract} />
          </div>
        </main>
      </div>
    </div>
  );
}
