import Navbar from "../_components/Navbar";
import Saudacao from "../_components/Saudacao";
import { ListCultivarTable } from "./_components/ListCultivarTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sementes",
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

export default async function SeedsPage() {

    return (
      <div className="flex flex-col w-full min-h-screen bg-found">
        <div className="min-h-screen w-full flex bg-background">
          <main className="flex-1 py-4 px-4 md:px-8 text-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-medium mb-4">Sementes</h1>
              <div className="flex items-center space-x-10">
                <Navbar />
                <Saudacao />
              </div>
            </div>

            <ListCultivarTable />
          </main>
        </div>
      </div>
    );
}
