import NavItems from "../../_components/NavItems";
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
      <div className="flex min-h-screen w-full flex-col bg-found">
        <div className="flex min-h-screen w-full bg-background">
          <main className="flex-1 px-4 py-4 text-gray-800 md:px-8 overflow-x-auto min-w-0">
            <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
              <h1 className="mb-4 text-2xl font-medium">Sementes</h1>
              <NavItems />
            </div>

            <ListCultivarTable />
          </main>
        </div>
      </div>
    );
}
