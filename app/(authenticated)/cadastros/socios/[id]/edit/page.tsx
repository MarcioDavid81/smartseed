import { db } from "@/lib/prisma";
import { Metadata } from "next";
import NavItems from "../../../../_components/NavItems";
import { NewMemberForm } from "../../new/_components/NewMemberForm";

export const metadata: Metadata = {
  title: "Editar Sócio",
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

export default async function EditMemberPage({ params }: Props) {
  const member = await db.member.findUnique({
    where: { id: params.id },
    include: {
      adresses: true,
    },
  });

  if (!member) {
    return <div>Sócio não encontrada</div>;
  }
  return (
    <div className="flex flex-col w-full h-full bg-found">
      <div className="w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Editar Sócio</h1> 
            <NavItems />
          </div>
          <div className="bg-white p-4 rounded-md shadow-md">
            <NewMemberForm initialData={member} isEditing />
          </div>
        </main>
      </div>
    </div>
  );
}
