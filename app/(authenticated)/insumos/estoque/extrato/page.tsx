import NavItems from "@/app/(authenticated)/_components/NavItems";
import HoverButton from "@/components/HoverButton";
import { Metadata } from "next";
import Link from "next/link";
import { ListInputStockStatementTable } from "./_components/ListInputStockStatementTable";

export const metadata: Metadata = {
  title: "Extrato de Estoque",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://www.marciodavid.dev.br" },
  ],
};

type Props = {
  searchParams: {
    productId: string;
    farmId: string;
  };
};

export default async function AgricultureStockStatementPage({
  searchParams,
}: Props) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Extrato de Estoque</h1> 
            <NavItems />
          </div>
          <div>
            <ListInputStockStatementTable
              productId={searchParams.productId}
              farmId={searchParams.farmId}
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            
            <Link href="/insumos/estoque">
              <HoverButton className="mt-4">Voltar</HoverButton>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
