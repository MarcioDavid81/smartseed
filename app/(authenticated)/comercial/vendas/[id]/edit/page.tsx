import NavItems from "@/app/(authenticated)/_components/NavItems";
import { Metadata } from "next";
import { db } from "@/lib/prisma";
import SaleContractForm from "../../new/_components/SaleContractForm";
import { SaleContractDetails } from "@/types";
import { getTenantOrThrow } from "@/lib/auth";
import { getSaleContractByIdForEdit } from "@/services/commercial/saleContracts";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Comercial - Editar Contrato de Venda",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [{ name: "Marcio David", url: "https://www.marciodavid.dev.br" }],
};

interface Props {
  params: {
    id: string;
  };
}

export default async function EditSaleContractPage({ params }: Props) {
  const { companyId } = await getTenantOrThrow();
  const saleContract = await getSaleContractByIdForEdit(params.id, companyId);

  if (!saleContract) {
    return notFound();
  }

  const serializedData = JSON.parse(
    JSON.stringify(saleContract),
  ) as SaleContractDetails;

  return (
    <div className="flex min-h-screen w-full flex-col bg-found">
      <div className="flex min-h-screen w-full bg-background">
        <main className="min-w-0 flex-1 px-4 text-gray-800 md:px-8">
          <div className="sticky top-0 z-40 -mx-4 flex flex-col items-start justify-between bg-background px-4 py-4 md:-mx-8 md:flex-row md:items-center md:px-8">
            <h1 className="mb-4 text-2xl font-medium md:mb-0">
              Comercial - Editar Contrato de Venda
            </h1>
            <NavItems />
          </div>

          <div className="pb-4">
            <SaleContractForm venda={serializedData} />
          </div>
        </main>
      </div>
    </div>
  );
}
