import { db } from "@/lib/prisma";
import { Metadata } from "next";
import NavItems from "../../../../_components/NavItems";
import CycleForm from "../../new/_components/NewCycleForm";

export const metadata: Metadata = {
  title: "Editar Safra",
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

interface Props {
  params: {
    id: string;
  };
}

export default async function EditAgricultureCropYieldsPage({ params }: Props) {
  const cycle = await db.productionCycle.findUnique({
    where: { id: params.id },
    include: {
      talhoes: true,
    },
  });

  if (!cycle) {
    return <div>Safra não encontrada</div>;
  }
  return (
    <div className="flex flex-col w-full h-full bg-found">
      <div className="w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Editar Safra</h1> 
            <NavItems />
          </div>
          <div className="bg-white p-4 rounded-md shadow-md">
            <CycleForm initialData={cycle} isEditing />
          </div>
        </main>
      </div>
    </div>
  );
}
