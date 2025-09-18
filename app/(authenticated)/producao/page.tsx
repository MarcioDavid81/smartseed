import { ScrollArea } from "@/components/ui/scroll-area";
import { Metadata } from "next";
import NavItems from "../_components/NavItems";

export const metadata: Metadata = {
  title: "Produção",
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

export default async function ProductionPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">
              Relatório de Produtividade
            </h1>
            <NavItems />
          </div>
          <ScrollArea className="w-full h-[650px] rounded-lg shadow-md">
            <iframe
              title="Relatório Cultivares Soja - 2025"
              src="https://app.powerbi.com/view?r=eyJrIjoiYjhiYTIyMmMtNzZhOS00ZWJlLWFlZGMtZTYzYjBiNzU4MWY4IiwidCI6ImU1MGEwNzk5LTA5NzUtNDEwYi1hZGVmLWI1MDYyN2NkMTUxMCJ9"
              frameBorder="0"
              allowFullScreen={true}
              className="w-full h-[650px] rounded-md"
            ></iframe>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
