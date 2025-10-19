import { Metadata } from "next";
import NavItems from "../../../_components/NavItems";
import { NewAgricultureCropYieldsForm } from "./_components/NewCycleForm";

export const metadata: Metadata = {
  title: "Nova Safra",
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
export default async function NewAgricultureCropYieldsPage() {
  return (
    <div className="flex flex-col w-full h-full bg-found">
      <div className="w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Nova Safra</h1> 
            <NavItems />
          </div>
          <div className="bg-white p-4 rounded-md shadow-md">
            <NewAgricultureCropYieldsForm onSubmit={async (data) => {
              "use server";
              await new Promise((resolve) => setTimeout(resolve, 1000));
              console.log(data);
            }} />
          </div>
        </main>
      </div>
    </div>
  );
}
